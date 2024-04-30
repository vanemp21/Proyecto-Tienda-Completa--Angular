import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { Login } from '../../models/login.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private register: RegisterService,
    private router:Router
    
  ) {}
  updateForm!: FormGroup;
  user: Login = {
    email: '',
    password: '',
  };
  google:boolean=false;
  islogged:boolean=false;
  ngOnInit(): void {
    this.updateForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.register.isLogged$.subscribe(isLogged => {
      this.islogged = isLogged; 
      if(this.islogged){
        this.router.navigate(['/']);
      }
    });

  }

onSubmitGoogle(){
this.google=true;
  this.register.loginGoogle();
}
  async onSubmit() {
    if (this.updateForm.valid) {
      const valorEmail: string = this.updateForm.get('email')!.value;
      const valorPass: string = this.updateForm.get('password')!.value;
      this.user = {
        email: valorEmail,
        password: valorPass,
      };
      this.register.userLogged(this.user);
    } else {
      if(!this.google){
        console.log('Ha ocurrido un error al iniciar sesión');
      }
    }
  }


}
