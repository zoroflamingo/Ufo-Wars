import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/user-auth.service';  
import { CommonModule } from '@angular/common';  // Import CommonModule


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit{
  title = 'ufowars';
  isLoggedIn = true;

  constructor(private authService: AuthService) {}
  

  // Check if the user is logged in (i.e., if there is a valid token)
  ngOnInit() {
    // Subscribe to the login status change observable
    this.authService.loggedInStatusChanged.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

}
