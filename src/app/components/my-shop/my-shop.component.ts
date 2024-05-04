import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { ProductoService } from '../../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-shop.component.html',
  styleUrl: './my-shop.component.css'
})
export class MyShopComponent implements OnInit {
  cartproducts: any[]=[];
  constructor(private register:RegisterService, private router:Router, private productsServices:ProductoService){}
  islogged:boolean=false;
ngOnInit(): void {
  this.register.isLogged$.subscribe(isLogged => {
    this.islogged = isLogged; 
    if(!this.islogged){
      this.router.navigate(['/login']);
    }
  })
    this.productsServices.showIdProducts()
    .then((products) => {
      this.cartproducts = products;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
   
  }
  deleteProductCart(id:number){
  console.log(id);
  
  }

 


}

