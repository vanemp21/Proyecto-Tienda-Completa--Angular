import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/product.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Producto } from '../../models/producto.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent  implements OnInit, OnDestroy{
  id: number | undefined;
  producto: Producto | undefined;
  productoSub: Subscription | undefined;
renderGalery: Boolean=true;
  galeria: Array<any> = [];
  constructor(
    private route: ActivatedRoute,
    private productService: ProductoService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
  ) {}
 
  getStarRating(rate: number) {
    const roundedRate = Math.round(rate); 
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < roundedRate) {
        stars += '★'; 
      } else {
        stars += '☆'; 
      }
    }
    return stars;
  }
  getImageUrl(imageUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.productoSub = this.productService.getProducto().subscribe({
      next: (productos: Producto[]) => {
        this.producto = productos.filter(p=>p.id == this.id)[0];
      },
      error: (err: any) => {
        console.error('Error', err);
      },
    });
  }
  ngOnDestroy(): void {
    this.productoSub?.unsubscribe();
  }
  products: any[] = [];
  getId(id:number | undefined,name:string, price:number, image:string){
// this.productService.getProducts(id, name, price, image)

  }

  agregarAlCarrito(id: number | undefined, name: string, price: number, image: string) {
    const newProduct = { id, name, price, image };
    this.products.push(newProduct);
    // Llama a la función para actualizar el carrito en la base de datos con el nuevo producto
    this.productService.updateCart(newProduct)
      .then(() => {
        this.toastr.success(
          `Se ha añadido correctamente al carrito`,
          'Producto añadido'
        );
    
      })
      .catch((error) => {
        this.toastr.error(
          `No se ha podido añadir al carrito`,
          'Error al añadir'
        );
      });
  }
  

}
