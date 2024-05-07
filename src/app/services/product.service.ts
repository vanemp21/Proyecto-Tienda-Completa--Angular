import { apiServer } from '../api-services/apiservice';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Producto } from '../models/producto.model';
import { ToastrService } from 'ngx-toastr';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  getFirestore,
  where,
  getDocs,
  collection,
  query,
  updateDoc,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private ApiUrl: string = apiServer.serverUrl;
  private totalSubject = new BehaviorSubject<number>(0);
  total$ = this.totalSubject.asObservable();
  constructor(
    private http: HttpClient,
    private firebaseAuth: Auth,
    private firestore: Firestore,
    private toastr: ToastrService
  ) {
    this.actualizarTotal();
  }
  getProducto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.ApiUrl}`);
  }
  user$ = user(this.firebaseAuth);
  app = initializeApp(environment);
  db = getFirestore(this.app);
  products: any[] = [];
  precio: number = 0;
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

  async eliminarProductoDelCarrito(
    productIndex: number,
    productId: number
  ): Promise<void> {
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
        if (productIndex >= 0 && productIndex < currentProducts.length) {
          currentProducts.splice(productIndex, 1);
          await updateDoc(doc.ref, { productsUser: currentProducts });
          this.toastr.success(`Producto eliminado correctamente`, 'Eliminado');
          try {
            const productData = await this.http
              .get<any>(`${this.ApiUrl}/${productId}`)
              .toPromise();
            const productPrice = productData.price;
          } catch (error) {
            console.error('Error al obtener el precio del producto:', error);
          }

          this.cartChangesSubject.next();
        } else {
          console.error(
            'El índice del producto está fuera de los límites del array.'
          );
        }
      }
    }
  }

  async obtenertotal(): Promise<number> {
    const total = await this.getTotalPrecio();
    return total;
  }

  async getTotalPrecio(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const auth = getAuth();
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          let mail: string | null = user.email;
          const cartCollectionRef = collection(this.db, 'cart');
          const q = query(cartCollectionRef, where('mail', '==', mail));
          const querySnapshot = await getDocs(q);
          let precio = 0;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data['productsUser']) {
              data['productsUser'].forEach((product: any) => {
                precio += product.price;
              });
              this.actualizarTotal();
            }
          });
          resolve(precio);
        }
      });
    });
  }
 
  async actualizarTotal() {
    try {
      const total = await this.obtenertotal();
      this.totalSubject.next(total);
    } catch (error) {
      console.error('Error al actualizar el total:', error);
    }
  }
 
}
