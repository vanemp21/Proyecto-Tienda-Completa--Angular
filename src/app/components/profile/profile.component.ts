import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(private register: RegisterService, private router: Router) {}
  islogged: boolean = false;
  ngOnInit(): void {
    this.register.isLogged$.subscribe((isLogged) => {
      this.islogged = isLogged;
      if (!this.islogged) {
        this.router.navigate(['/login']);
      }
    });
  }
}
