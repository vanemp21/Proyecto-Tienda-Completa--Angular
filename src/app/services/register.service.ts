import { Injectable, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  doc,
  getFirestore,
  setDoc,
  onSnapshot,
  where,
  getDocs,
  collection,
  query,
  updateDoc,
} from 'firebase/firestore';
import { Toast, ToastrService } from 'ngx-toastr';
import { Login } from '../models/login.model';

import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(
    private firebaseAuth: Auth,
    private firestore: Firestore,
    private toastr: ToastrService
  ) {}
  existe: boolean = true;
  mail: string = '';
  app = initializeApp(environment);
  db = getFirestore(this.app);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<Login | null | undefined>(undefined);

  async registroAuth(email: string, password: string) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        this.existe = false;
        const user = userCredential.user;
        sendEmailVerification(user)
          .then(() => {
            this.toastr.success(
              'Registro completado',
              `Se ha enviado un correo de verificación a ${user.email}`
            );
          })
          .catch((error) => {
            this.toastr.error('Error', 'Error al enviar el mensaje');
          });
        this.registroDB(email, password,false);
        console.log('llego hasta aqui ' + email);
        return user;
      })
      .catch((error) => {
        const errorCode = error.code;
        let errormessage = '';
        switch (error.code) {
          case 'auth/email-already-in-use':
            errormessage = `Email address ${email} already in use.`;

            break;
          case 'auth/invalid-email':
            errormessage = `Email address ${email} is invalid.`;
            break;
          case 'auth/operation-not-allowed':
            errormessage = 'Error during sign up.';
            break;
          case 'auth/weak-password':
            errormessage =
              'Password is not strong enough. Add additional characters including special characters and numbers.';
            break;
          default:
            errormessage = error.message;
            break;
        }
        this.toastr.error('Error', errormessage);
        this.existe = true;
        return errorCode;
      });
  }
  async registroDB(email: string, password:string, islogged: boolean) {
    const correo = email;
    if (!islogged) {
      const loggedUp = collection(this.firestore, 'login');
      try {
        const docRef = await addDoc(loggedUp, {
          correo,
          password,
          logged: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async userLogged(user: Login) {

    const auth = getAuth();
    
    signInWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {        
        const user = userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });

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

      // signOut(this.firebaseAuth);
      // console.log(userlogged);

      const useRef = doc(db, `login/${userlogged}`);
      updateDoc(useRef, {
        correo: user.email,
        logged: true,
      });
      
    } catch (error) {
      console.error('Error al realizar la operación: ', error);
    }
  }
}
