import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class MyShopComponent implements OnInit, OnDestroy{
  cartproducts: any[] = [];
  islogged: boolean = false;
  private cartSubscription: Subscription | undefined;


  constructor(
    private register: RegisterService,
    private router: Router,
    private productsServices: ProductoService
  ) {}

  // userEmail=this.register.getMail()
  ngOnInit(): void {
    this.register.isLogged$.subscribe((isLogged) => {
      this.islogged = isLogged;
      if (!this.islogged) {
        this.router.navigate(['/login']);
      }
    });
    this.cartSubscription = this.productsServices.cartChanges.subscribe(() => {
      this.actualizarProductosDelCarrito();
    });
    this.actualizarProductosDelCarrito();

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

  deleteProductCart(id: number) {
    this.productsServices.eliminarProductoDelCarrito(id)
      .then(() => {
        console.log('Producto eliminado del carrito y actualizado con éxito');
      })
      .catch((error) => {
        console.error('Error al eliminar el producto del carrito:', error);
      });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

}

