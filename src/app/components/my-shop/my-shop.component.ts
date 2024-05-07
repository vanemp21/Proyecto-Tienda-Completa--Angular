import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { ProductoService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-shop.component.html',
  styleUrl: './my-shop.component.css',
})
export class MyShopComponent implements OnInit, OnDestroy {
  cartproducts: any[] = [];
  islogged: boolean = false;
  private cartSubscription: Subscription | undefined;
  private totalSubscription: Subscription | undefined;
  total: number=0;
  constructor(
    private register: RegisterService,
    private router: Router,
    private productsServices: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}


  async ngOnInit(): Promise<void> {
    this.cartSubscription = this.productsServices.cartChanges.subscribe(() => {
      this.actualizarProductosDelCarrito();
    });

    this.register.isLogged$.subscribe((isLogged) => {
      this.islogged = isLogged;
      if (!this.islogged) {
        this.router.navigate(['/login']);
      }
    });
  
    // this.total=this.productsServices.obtenerTotal()
    this.actualizarProductosDelCarrito();
    //ME QUEDE AQUÍ
    // this.obtenerTotal()
    this.totalSubscription = this.productsServices.total$.subscribe(total => {
      this.total = total;
    });
  }
 async obtenerTotal(){
  try {
    this.total = await this.productsServices.obtenertotal();
  } catch (error) {
    console.error('Error al obtener el total:', error);
  }
}
 
  actualizarProductosDelCarrito() {
    this.productsServices
      .showIdProducts()
      .then((products) => {
        this.cartproducts = products;
      })
      .catch((error) => {
        console.error('Error al obtener productos del carrito:', error);
      });
  }

  deleteProductCart(index: number, id: number) {
    this.productsServices
      .eliminarProductoDelCarrito(index, id)
      .then(() => {
        
      })
      .catch((error) => {
        console.error('Error al eliminar el producto del carrito:', error);
      });
  }
  
  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    this.totalSubscription!.unsubscribe();
 
  }
}
