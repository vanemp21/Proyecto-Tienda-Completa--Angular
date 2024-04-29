import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/product.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Producto } from '../../models/producto.model';

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
    private sanitizer: DomSanitizer
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
}
