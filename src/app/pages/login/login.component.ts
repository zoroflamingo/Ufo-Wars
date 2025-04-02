import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/user-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userName: string = '';
  password: string = '';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.updateLoginState();
  }

  updateLoginState() {
    this.isLoggedIn = localStorage.getItem('login') === 'true';
  }

  async onSubmit() {
    if (this.isLoggedIn){
      this.logout();
      this.router.navigate(['/home']);
    } else {
      if (this.userName && this.password) {  
        try {
          await this.authService.login(this.userName, this.password);
          this.isLoggedIn = this.authService.getLoggedInStatus();
          alert('Login successful!');
        } catch (error: any) {
          alert('Login failed: ' + error.message);
        }
      } else {
        alert('Please fill out all fields.');
      }
  
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    alert('Logged out successfully');
  }
}