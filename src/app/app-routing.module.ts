import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { ArchivioComponent } from "../components/archivio/archivio.component";
import { SchedaComponent } from "../components/scheda/scheda.component";
import { Edit_tablerowComponent } from "../components/edit_tablerow/edit_tablerow.component";
import { LoginComponent } from "../components/login/login.component";
import { RegistrationComponent } from "../components/registration/registration.component";
import { authGuard } from "../shared/auth.guard";
import { TimerComponent } from "../components/timer/timer.component";
import { Offline_timerComponent } from "../components/offline_timer/offline_timer.component";
import { HomeComponent } from "../components/home/home.component";
import { Email_verificationComponent } from "../components/email_verification/email_verification.component";

const routes: Routes = [
  // Elenco delle rotte
  { path: 'navbar', component: NavbarComponent },
  { path: 'archivio', component: ArchivioComponent, canActivate: [authGuard]},
  { path: 'edit_tablerow', component: Edit_tablerowComponent, canActivate: [authGuard]},
  { path: 'login', component: LoginComponent},
  { path: 'registration', component: RegistrationComponent},
  { path: 'scheda/:id', component: SchedaComponent, canActivate: [authGuard]},
  { path: 'timer/:id', component: TimerComponent, canActivate: [authGuard]},
  { path: 'offline_timer', component: Offline_timerComponent},
  { path: 'home', component: HomeComponent},
  { path: 'email_verification', component: Email_verificationComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }//in caso di risorsa non trovata
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
