import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Usuario } from '../../models/user.model';
import { RegisterService } from '../../services/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-datos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mis-datos.component.html',
  styleUrl: './mis-datos.component.css',
})
export class MisDatosComponent implements OnInit {
  dataForm!: FormGroup;
  user: Usuario = {
    email: '',
    name: '',
    secondName: '',
    address1: '',
    address2: '',
  };
  showData: Usuario | null = null;
  email: string | null = '';
  islogged: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: RegisterService,
    private router: Router
  ) {}
  ngOnInit() {
    this.dataForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      secondName: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['', [Validators.required]],
    });

    this.authService.userEmail$.subscribe((email: string | null) => {
      this.email = email;
      this.loadData();
    });
    this.authService.isLogged$.subscribe((isLogged) => {
      this.islogged = isLogged;
      if (!this.islogged) {
        this.router.navigate(['/']);
      }
    });
  }
  async loadData() {
    if (this.email) {
      this.showData = await this.authService.getdataUser(this.email);
    }
  }
  async onSubmit() {
    if (this.dataForm.valid) {
      const valorName: string = this.dataForm.get('name')!.value;
      const valorSecondName: string = this.dataForm.get('secondName')!.value;
      const valorAddress1: string = this.dataForm.get('address1')!.value;
      const valorAddress2: string = this.dataForm.get('address2')!.value;
      this.user = {
        email: this.email,
        name: valorName,
        secondName: valorSecondName,
        address1: valorAddress1,
        address2: valorAddress2,
      };
      await this.authService.setdataUser(this.user);
      this.showData = this.user;
    }
  }
}
