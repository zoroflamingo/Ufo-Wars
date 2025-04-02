import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PreferencesService } from '../../services/preferences.service';
import { AuthService } from '../../services/user-auth.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class PreferencesComponent implements OnInit{
  preferencesForm: FormGroup;
  username: string = ''; 

  constructor(
    private fb: FormBuilder,
    private preferencesService: PreferencesService,
    public authService: AuthService
  ) {
    this.preferencesForm = this.fb.group({
      ufoAmount: ['1'],
      timeAmount: ['60']
    });
  }

  ngOnInit(): void {
    console.log('Is user logged in:', this.authService.getLoggedInStatus());
    const { gameTimer, ufoCount } = this.preferencesService.getPreferences();
    this.preferencesForm.patchValue({
      timeAmount: gameTimer,
      ufoAmount: ufoCount,
    });

    if (this.authService.getLoggedInStatus()) {
      this.authService.username$.subscribe(username => {
        this.username = username || '';
        this.preferencesService.getPreferencesRemotely(this.username).subscribe(data => {
          console.log(data.time);
          console.log(data.ufos);
          this.preferencesForm.patchValue({
            timeAmount: data.time,
            ufoAmount: data.ufos,
          });
        });
      });
    }
  }

  onSaveLocally(): void {
    const preferences = this.preferencesForm.value;
    this.preferencesService.savePreferences(preferences.timeAmount, preferences.ufoAmount);
    alert('Preferences saved!');
  }

  onSaveRemotely(): void {
    if (this.authService.getLoggedInStatus()) {
      const preferences = this.preferencesForm.value;

      const usernameToUse = this.username || '';

      this.preferencesService
        .savePreferencesRemotely(usernameToUse, preferences.timeAmount, preferences.ufoAmount)
        .subscribe({
          next: () => alert('Preferences saved remotely!'),
          error: (err) => alert('Failed to save remotely: ' + err.message),
        });
    } else {
      alert('Please log in first!');
    }
  }
}