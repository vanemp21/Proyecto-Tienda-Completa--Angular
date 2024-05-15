import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
  islogged:boolean=false;
  email:string | null = ''
  constructor(private authService: RegisterService) {}
  ngOnInit(): void {
    this.authService.isLogged$.subscribe(isLogged => {
      this.islogged = isLogged; 
    });
    this.authService.userEmail$.subscribe((email: string | null) => {
      this.email = email;
    });
  }
 async logout() {
  const notlogged = await this.authService.logout()
  }

}
