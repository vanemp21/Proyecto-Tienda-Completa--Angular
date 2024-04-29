import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductoService } from '../../../services/product.service';
import { Producto } from '../../../models/producto.model';
import { Subscription } from 'rxjs';
import { ProductComponent } from '../product/product.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productlist',
  standalone: true,
  imports: [ProductComponent, CommonModule],
  templateUrl: './productlist.component.html',
  styleUrl: './productlist.component.css'
})
export class ProductlistComponent implements OnInit, OnDestroy {
  producto:Producto[]=[]
productoSub: Subscription | undefined;
constructor(private productoService:ProductoService){}
ngOnInit(): void {
  this.productoSub=this.productoService.getProducto().subscribe({
     next:(producto:Producto[]) =>{
       this.producto = producto;
     },
     error:(err:any)=>{
       console.error(err)
     },
     complete:()=>{
     }
   })
 }
 ngOnDestroy(): void {
   this.productoSub?.unsubscribe();
 }
}
