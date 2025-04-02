import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './user-auth.service';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly API_URL = 'http://localhost:3000/preferences';   
  private readonly DEFAULT_TIMER = '60';
  private readonly DEFAULT_UFO_COUNT = '1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPreferences(): { gameTimer: number; ufoCount: number } {
    const gameTimer = parseInt(localStorage.getItem('gameTimer') || this.DEFAULT_TIMER, 10);
    const ufoCount = parseInt(localStorage.getItem('ufoCount') || this.DEFAULT_UFO_COUNT, 10);
    return { gameTimer, ufoCount };
  }

  savePreferences(gameTimer: number, ufoCount: number): void {
    localStorage.setItem('gameTimer', gameTimer.toString());
    localStorage.setItem('ufoCount', ufoCount.toString());
  }

  getPreferencesRemotely(username: string): Observable<any> {
    console.log(`Calling API: ${this.API_URL}/${username}`);
    return this.http.get(`${this.API_URL}/${username}`, { headers: { 'Cache-Control': 'no-cache' } });
  }

  savePreferencesRemotely(username: string, gameTimer: number, ufoCount: number): Observable<any> {
    return this.http.post(this.API_URL, { username, ufos: ufoCount, time: gameTimer });
  }

  isUserLoggedIn(): boolean {
    return this.authService.getLoggedInStatus();
  }
  
}
