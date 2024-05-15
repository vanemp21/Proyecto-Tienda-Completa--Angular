import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Producto } from '../../../models/producto.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../../services/product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  constructor(
    private sanitizer: DomSanitizer,
    productoService: ProductoService
  ) {}
  @Input() item: Producto | undefined;

  getImageUrl(imageUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

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
}
