import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PlayComponent } from './pages/play/play.component';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { RecordsComponent } from './pages/records/records.component';
import { RegisterComponent } from './pages/register/register.component';
import { MessagesComponent } from './pages/messages/messages.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'play', component: PlayComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'records', component: RecordsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'messages', component: MessagesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
