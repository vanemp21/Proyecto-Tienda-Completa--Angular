import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})

export class HeaderComponent implements OnInit {
  islogged:boolean=false;
  constructor(private authService: RegisterService) {}
  ngOnInit(): void {
    this.authService.isLogged$.subscribe(isLogged => {
      this.islogged = isLogged; 
    });
  }
 async logout() {
  const notlogged = await this.authService.logout()
  }

}
