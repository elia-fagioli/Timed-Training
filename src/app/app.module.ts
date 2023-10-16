//Moduli
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule} from "@angular/fire/compat/auth";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import { environment} from "../environments/environment";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
//Services
import {AuthService} from "../shared/auth.service";
import {authGuard} from "../shared/auth.guard";
import {NgOptimizedImage} from "@angular/common";
//Componenti
import { AppComponent } from './app.component';
import {NavbarComponent} from "../components/navbar/navbar.component";
import {ArchivioComponent} from "../components/archivio/archivio.component";
import {Edit_tablerowComponent} from "../components/edit_tablerow/edit_tablerow.component";
import {SchedaComponent} from "../components/scheda/scheda.component";
import {LoginComponent} from "../components/login/login.component";
import {RegistrationComponent} from "../components/registration/registration.component";
import {TimerComponent} from "../components/timer/timer.component";
import {Offline_timerComponent} from "../components/offline_timer/offline_timer.component";
import {HomeComponent} from "../components/home/home.component";
import {Email_verificationComponent} from "../components/email_verification/email_verification.component";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ArchivioComponent,
    Edit_tablerowComponent,
    SchedaComponent,
    LoginComponent,
    RegistrationComponent,
    TimerComponent,
    Offline_timerComponent,
    HomeComponent,
    Email_verificationComponent
  ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFirestoreModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: !isDevMode(),
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
        NgOptimizedImage,
    ],
  providers: [AuthService, authGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
