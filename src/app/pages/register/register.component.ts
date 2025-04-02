import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  userName: string = '';
  email: string = '';
  password: string = '';
  passwordRep: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    if (isLoggedIn) {
      alert('You are already logged in!');
      this.router.navigate(['/home']);
    }
  }

  async onSubmit() {
    if (this.userName && this.email && this.password && this.passwordRep) {
      if (this.password !== this.passwordRep) {
        alert('Passwords do not match!');
        return;
      }

      if (!this.isValidEmail(this.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      try {
        await this.checkUser(this.userName)
        await this.register(this.userName, this.email, this.password);
      } catch (error: any) {
        alert('Registration failed: ' + error.message);
      }
    } else {
      alert('Please fill out all fields.');
    }
  }
  async checkUser(username:string){
    try {
      const url = `http://wd.etsisi.upm.es:10000/users/${username}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json",
        },

      });
      if (response.status === 200){
        throw new Error('Username already exists. Please choose a different one.');
      } else if (response.status === 500){
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error: any){
      throw error;
    }
    
  }

  async register(username: string, email: string, password: string) {
    try {
      const url = `http://wd.etsisi.upm.es:10000/users`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          alert("Missing required fields.");
        } else if (response.status === 409) {
          alert("Username or email already exists.");
        } else {
          alert("Internal server error.");
        }
        throw new Error(`Error: ${response.status}`);
      }

      alert("Registration successful!");
      this.router.navigate(['/home']);
      
    } catch (error: any) {
      console.error("Registration error:", error.message);
      throw error;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}