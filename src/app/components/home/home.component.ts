import { Component } from '@angular/core';
import { ProductlistComponent } from '../cart/productlist/productlist.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductlistComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {

}
