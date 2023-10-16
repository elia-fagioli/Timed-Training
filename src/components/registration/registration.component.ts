import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {Router} from "@angular/router";
import {getAuth, sendEmailVerification} from "@angular/fire/auth";

import {AuthService} from "../../shared/auth.service";
import {FirestoreService} from "../../shared/firestore.service";

import { UserInterface } from "../../interfaces/user.interface";
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  //form per i validators
  form: FormGroup;
  showPassword = false;
  already_exists: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router : Router,
              private firestoreService: FirestoreService) {
    this.form = this.fb.group({
      "email": ["", [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      "password": ["", [Validators.required, Validators.pattern(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*.])(?=.{8,})/
      ),]]
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
  registrazioneEmailPassword() {
    this.already_exists = false;

    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;

    // Registra l'utente con email e password
    this.authService.registrationEmailPassword(email, password)
      .then(() => {
        // Registrazione avvenuta con successo
        this.sendEmail();

        // Creazione dell'oggetto dell'utente da aggiungere alla collezione
        const newUser: UserInterface = {
          email: email
        };

        const collectionPath = 'users';

        // Aggiunge l'utente alla collezione degli utenti nel database Firestore
        this.firestoreService.addDocument(collectionPath, newUser)
          .then(() => {
            // Esegui il redirect alla pagina home
            this.router.navigateByUrl('/email_verification').then(() => {
              // La navigazione è stata completata con successo
            });
          })
          .catch((error: any) => {
            console.error('Si è verificato un errore nella registrazione');
          });
      })
      .catch((error: any) => {
        if (error.code === 'auth/email-already-in-use') {
          // L'utente è già registrato con questa email
          this.already_exists = true;
        } else {
          console.error('Errore durante la registrazione con email e password:', error);
        }
      });
  }

  sendEmail() {
    //verifica utente tramite link nell'email
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      sendEmailVerification(user)
        .then(() => {
          //email inviata
        })
        .catch((error: any) => {
          console.error('Errore invio email di verifica');
        });
    } else {
      console.log("Utente non disponibile");
    }
  }
}

