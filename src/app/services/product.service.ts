import { apiServer } from '../api-services/apiservice';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Producto } from '../models/producto.model';

import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Injectable, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  doc,
  getFirestore,
  where,
  getDocs,
  collection,
  query,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
 

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private ApiUrl: string = apiServer.serverUrl;
  constructor(
    private http: HttpClient,
    private firebaseAuth: Auth,
    private firestore: Firestore,
  
  ) {}
  getProducto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.ApiUrl}`);
  }
  user$ = user(this.firebaseAuth);
  app = initializeApp(environment);
  db = getFirestore(this.app);
  products: any[] = [];
  private cartChangesSubject: Subject<void> = new Subject<void>();
  cartChanges = this.cartChangesSubject.asObservable();
  getProducts(
    id: number | undefined,
    name: string,
    price: number,
    image: string
  ) {
    this.products.push({ id, name, price, image });
  }
  async showIdProducts(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      const auth = getAuth();
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          let mail: string | null = user.email;
          const cartCollectionRef = collection(this.db, 'cart');
          const q = query(cartCollectionRef, where('mail', '==', mail));
          const querySnapshot = await getDocs(q);
          const products: any[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data['productsUser']) {
              data['productsUser'].forEach((product: any) => {
                products.push(product);
              });
            }
          });
          resolve(products);
        } else {
          reject('Usuario no autenticado');
        }
      });
    });
  }

  async updateCart(product: any): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const mail: string | null = user.email;
      const cartCollectionRef = collection(this.db, 'cart');
      const q = query(cartCollectionRef, where('mail', '==', mail));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size > 0) {
        const doc = querySnapshot.docs[0];  
        const currentProducts = doc.data()['productsUser'] || [];
        const updatedProducts = [...currentProducts, product];
        await updateDoc(doc.ref, { productsUser: updatedProducts });
      } else {
        await addDoc(cartCollectionRef, { mail, productsUser: [product] });
      }
    } else {
      console.log('No hay usuario logeado');
    }
  }
  



  async eliminarProductoDelCarrito(productId: number): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const mail: string | null = user.email;
      const cartCollectionRef = collection(this.db, 'cart');
      const q = query(cartCollectionRef, where('mail', '==', mail));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size > 0) {
        const doc = querySnapshot.docs[0];
        const currentProducts = doc.data()['productsUser'] || [];
        const updatedProducts = currentProducts.filter((product: any) => product.id !== productId);
        await updateDoc(doc.ref, { productsUser: updatedProducts });
        this.cartChangesSubject.next();

      }
    }
  }
  
  
//   async getProductsDB(){
//   const auth = getAuth();
//   const user = auth.currentUser;
//   if (user) {
//     const mail: string | null = user.email;
//       const cartCollectionRef = collection(this.db, 'cart');
//       let products:any[]=[]
//       const q = query(cartCollectionRef, where('mail', '==', mail));
//       const querySnapshot = await getDocs(q);
//       if (querySnapshot.size > 0) {
//         querySnapshot.forEach((d)=>{
//         console.log(d.data()['productsUser']);
//         products=d.data()['productsUser']
        
//         })
//       }else{
//         products=['No hay productos']
//       }
//   }
//   return this.products
// }
  
}
