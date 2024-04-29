import { Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
    constructor(private firebaseAuth: Auth, private firestore:Firestore){}
existe:boolean=true;
mail:string='';
user$ = user(this.firebaseAuth);



 async registroAuth(email:string,password:string){
  
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        this.existe = false;
        const user = userCredential.user;
        
        // sendEmailVerification(user)
        // .then(() => {
        //   console.log('Se ha enviado un correo electrónico de verificación a', user.email);
        // })
        // .catch((error) => {
        //   console.error('Error al enviar correo electrónico de verificación:', error);
        // });
     
         this.registroDB(email,false)
        console.log('llego hasta aqui '+email)
        return user
      })
      .catch((error) => {

        const errorCode = error.code;
        const errorMessage = error.message;
        switch (error.code) {
            case 'auth/email-already-in-use':
              console.log(`Email address ${email} already in use.`);
              break;
            case 'auth/invalid-email':
              console.log(`Email address ${email} is invalid.`);
              break;
            case 'auth/operation-not-allowed':
              console.log(`Error during sign up.`);
              break;
            case 'auth/weak-password':
              console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
              break;
            default:
              console.log(error.message);
              break;
          }
          return errorCode
    
      });
}

    async registroDB(email:string, islogged:boolean){
    const correo = email;
    if(!islogged){
      const loggedUp = collection(this.firestore, 'login');
      try{
        const docRef = await addDoc(loggedUp,{
            correo,
            logged:true
        });
      }catch(error){
     console.log(error)
      }
    }
    }
eliminarDB(){

}



}
