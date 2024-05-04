import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { MyShopComponent } from './components/my-shop/my-shop.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path:'producto/:id', component: CartComponent},
    {path:'profile', component: ProfileComponent},
    {path:'my-shop', component: MyShopComponent},
    {path:'**', redirectTo:'/'},
   
];
