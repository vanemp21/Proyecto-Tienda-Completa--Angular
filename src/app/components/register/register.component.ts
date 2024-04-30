import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Register } from '../../models/register.model';
import { RegisterService } from '../../services/register.service';
import {  NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  constructor( private formBuilder: FormBuilder, private registerService: RegisterService, private router:Router){}
  registerForm!: FormGroup
  islogged:boolean=false;
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.registerService.isLogged$.subscribe(isLogged => {
      this.islogged = isLogged; 
      if(this.islogged){
        this.router.navigate(['/']);
      }
    });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const registrarUsuario: Register = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      };
      try {
       this.registerService.registroAuth(registrarUsuario.email, registrarUsuario.password);
      } catch (error) {
        console.error('Error durante el registro y/o guardado en la base de datos:', error);
      }
    }
  }
  

}
