import { Injectable, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  addDoc,
  doc,
  getFirestore,
  where,
  getDocs,
  collection,
  query,
  updateDoc,
} from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { Login } from '../models/login.model';

import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(
    private firebaseAuth: Auth,
    private firestore: Firestore,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.checkAuthState();
    this.initAuthListener();
  }
  username: string | null = '';
  app = initializeApp(environment);
  db = getFirestore(this.app);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<Login | null | undefined>(undefined);
  private isLoggedSubject = new BehaviorSubject<boolean>(false);
  isLogged$ = this.isLoggedSubject.asObservable();
  private userEmailSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);
  userEmail$ = this.userEmailSubject.asObservable();
  private userDataSubject: BehaviorSubject<Usuario | null> =
    new BehaviorSubject<Usuario | null>(null);
  userData$: Observable<Usuario | null> = this.userDataSubject.asObservable();

  isGoogle: boolean = false;
  private checkAuthState() {
    const user = localStorage.getItem('user');
    if (user) {
      this.isLoggedSubject.next(true);
    }
  }
  tokens: string | undefined = '';
  async registroAuth(email: string, password: string) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        sendEmailVerification(user)
          .then(() => {
            this.toastr.success(
              `Se ha enviado un correo de verificación a ${user.email}`,
              'Registro completado'
            );
            localStorage.setItem('user', 'authenticated');
          })
          .catch(() => {
            this.toastr.error('Error al enviar el mensaje', 'Error');
          });
        this.registroDB(email, password, false, user.uid);
        this.isLoggedSubject.next(true);
        return user;
      })
      .catch((error) => {
        const errorCode = error.code;
        let errormessage = '';
        switch (error.code) {
          case 'auth/email-already-in-use':
            errormessage = `El correo ${email} ya está en uso.`;
            break;
          case 'auth/invalid-email':
            errormessage = `El correo ${email} es inválido.`;
            break;
          case 'auth/operation-not-allowed':
            errormessage = 'Error durante el inicio de sesión.';
            break;
          case 'auth/weak-password':
            errormessage = 'La contraseña no es suficientemente segura.';
            break;
          default:
            errormessage = error.message;
            break;
        }
        this.toastr.error(errormessage, 'Error');

        return errorCode;
      });
  }
  async registroDB(
    email: string,
    password: string,
    islogged: boolean,
    uid: string
  ) {
    const correo = email;
    if (!islogged) {
      const loggedUp = collection(this.firestore, 'login');
      try {
        const docRef = await addDoc(loggedUp, {
          correo,
          password,
          logged: true,
          uid,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  loginGoogle() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    let userlogged: string = '';
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const db = getFirestore(this.app);
        const loginCollectionRef = collection(db, 'login');
        const q = query(loginCollectionRef, where('correo', '==', user.email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size <= 0) {
          await this.registroDB(user.email!, 'googleaccount', false, user.uid);
        }
        querySnapshot.forEach((d) => {
          userlogged = d.id;
        });
        const useRef = doc(db, `login/${userlogged}`);
        updateDoc(useRef, {
          logged: true,
        });
        this.isLoggedSubject.next(true);
        localStorage.setItem('user', 'authenticated');
        this.isGoogle = true;

        this.toastr.success(
          `Has iniciado sesión, serás redirigido a la página principal`,
          '¡Bienvenido!'
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }
  async userLogged(user: Login) {
    const auth = getAuth();
    try {
      let userlogged: string = '';
      const db = getFirestore(this.app);
      const loginCollectionRef = collection(db, 'login');
      const q = query(
        loginCollectionRef,
        where('correo', '==', user.email),
        where('password', '==', user.password)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => {
        userlogged = d.id;
      });
      const useRef = doc(db, `login/${userlogged}`);
      updateDoc(useRef, {
        correo: user.email,
        logged: true,
      }).then(() => {
        signInWithEmailAndPassword(auth, user.email, user.password)
          .then((userCredential) => {
            this.toastr.success(
              `Has iniciado sesión, serás redirigido a la página principal`,
              '¡Bienvenido!'
            );
            localStorage.setItem('user', 'authenticated');

            this.isLoggedSubject.next(true);
          })
          .catch((error: any) => {
            const errorMessage = error.message;
            console.log(errorMessage);
          });
      });
    } catch (error) {
      console.error('Error al realizar la operación: ', error);
    }
  }

  async logout() {
    const email = this.firebaseAuth.currentUser?.email;
    let imlogged: boolean = false;
    try {
      let userlogged: string = '';
      const db = getFirestore(this.app);
      const loginCollectionRef = collection(db, 'login');
      const q = query(loginCollectionRef, where('correo', '==', email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => {
        userlogged = d.id;
      });
      const useRef = doc(db, `login/${userlogged}`);
      updateDoc(useRef, {
        logged: false,
      }).then(() => {
        localStorage.removeItem('user');
        signOut(this.firebaseAuth);
        this.toastr.success(`Has cerrado sesión correctamente`, 'Deslogin');
        imlogged = true;
        this.isLoggedSubject.next(false);
      });
    } catch (error) {
      console.error('Error al realizar la operación: ', error);
      imlogged = false;
    }
    return imlogged;
  }

  async setdataUser(user: Usuario) {
    const logged = localStorage.getItem('user');
    let userlogged = '';
    const db = getFirestore(this.app);
    const loginCollectionRef = collection(db, 'user-data');
    const q = query(loginCollectionRef, where('email', '==', user.email));
    const querySnapshot = await getDocs(q);
    if (logged) {
      if (querySnapshot.size > 0) {
        querySnapshot.forEach((d) => {
          userlogged = d.id;
        });
        const useRef = doc(db, `user-data/${userlogged}`);
        updateDoc(useRef, {
          address1: user.address1,
          address2: user.address2,
          name: user.name,
          secondName: user.secondName,
        });
        this.toastr.success(
          `Se ha actualizado correctamente tus datos`,
          'Datos actualizados'
        );
      } else {
        try {
          const docRef = await addDoc(loginCollectionRef, user);
          this.toastr.success(
            `Se ha añadido correctamente tus datos`,
            'Datos añadidos'
          );
        } catch (error) {
          console.log('Estoy en el error de añadir' + error);
        }
      }
    } else {
      console.log('No se ha podido actualizar');
    }
  }
  async getdataUser(gmail: string | null): Promise<Usuario | null> {
    const db = getFirestore(this.app);
    const loginCollectionRef = collection(db, 'user-data');
    const q = query(loginCollectionRef, where('email', '==', gmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      const data = querySnapshot.docs[0].data();
      const usuario: Usuario = {
        email: data['email'],
        name: data['name'],
        secondName: data['secondName'],
        address1: data['address1'],
        address2: data['address2'],
      };
      this.userDataSubject.next(usuario);
      return usuario;
    } else {
      this.userDataSubject.next(null);
    }
    return null;
  }

  private initAuthListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.userEmailSubject.next(user.email);
      } else {
        this.userEmailSubject.next(null);
      }
    });
  }
}
