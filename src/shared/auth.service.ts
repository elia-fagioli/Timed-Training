import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {GoogleAuthProvider} from "firebase/auth";
import {FirestoreService} from "./firestore.service";
@Injectable({
  providedIn: 'root',
})

export class AuthService {
  isLoggedIn: boolean;
  already_exists: boolean;
  constructor(
    public afAuth: AngularFireAuth,
    public router: Router
  ) {
    this.isLoggedIn = false;
    this.already_exists = false;
  }

  getStatus(): boolean{
    return this.isLoggedIn;
  }
  async loginGoogle(){
    try{
      //attendo completamento signin
      await this.afAuth.signInWithPopup(new GoogleAuthProvider());

      //cambio di stato
      this.isLoggedIn=true;
    } catch (error) {
      console.error('Errore durante il login con Google');
      throw error;
    }
  }

  async signWithEmailAndPassword(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.isLoggedIn=true;
    } catch (error) {
      console.error('Errore durante il login con email e password');
      throw error;
    }
  }
  // Sign out
  async logout() {
    try {
      await this.afAuth.signOut();
      this.isLoggedIn=false;
      this.router.navigate(['/']).then();
    } catch (error) {
      console.error('Errore durante il logout');
      throw error;
    }
  }
  async registrationEmailPassword(email: string, password: string){
    try {
      await this.afAuth.createUserWithEmailAndPassword(email, password);
    } catch (error:any) {
      if (error.code === 'auth/email-already-in-use') {
        // L'utente è già registrato con questa email
        console.error('Utente già registrato con questa email');
      } else {
        // Gestisci altri errori qui
        console.error('Errore durante la registrazione con email e password');
      }
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      // Notifica all'utente che l'email di reset password è stata inviata con successo
    } catch (error) {
      console.error('Errore durante l\'invio dell\'email di reset password');
      throw error;
    }
  }

}
