import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [],
  templateUrl: './my-shop.component.html',
  styleUrl: './my-shop.component.css'
})
export class MyShopComponent implements OnInit {
  constructor(private register:RegisterService, private router:Router){}
  islogged:boolean=false;
ngOnInit(): void {
  this.register.isLogged$.subscribe(isLogged => {
    this.islogged = isLogged; 
    if(!this.islogged){
      this.router.navigate(['/login']);
    }
  });
}

}
