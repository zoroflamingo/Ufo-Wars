import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loggedInSubject = new BehaviorSubject<boolean>(false);
  loggedInStatusChanged = this.loggedInSubject.asObservable();
  private readonly usernameSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    this.updateLoginState();
  }

  private updateLoginState(): void {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    this.loggedInSubject.next(isLoggedIn);

    if (isLoggedIn) {
      this.usernameSubject.next(localStorage.getItem('username') ?? null);
    } else {
      this.usernameSubject.next(null);
    }
  }

  get loggedIn$() {
    return this.loggedInSubject.asObservable();
  }

  get username$() {
    return this.usernameSubject.asObservable();
  }

  login(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `http://wd.etsisi.upm.es:10000/users/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  
      fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Login failed - invalid credentials or other error.');
          }
          const token = response.headers.get('Authorization');
          if (token) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('login', 'true');
            localStorage.setItem('username', username);
            this.updateLoginState();
            resolve();
          } else {
            throw new Error('Token not found in response body');
          }
        })
        .catch((error: unknown) => {
          // Ensure that error is an instance of Error
          if (error instanceof Error) {
            reject(error);
          } else {
            // Reject with a generic Error if not an instance of Error
            reject(new Error('An unknown error occurred during login.'));
          }
        });
    });
  }
  
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.setItem('login', 'false');
    localStorage.removeItem('username');
    this.updateLoginState();
  }

  getLoggedInStatus(): boolean {
    return this.loggedInSubject.value; 
  }
}