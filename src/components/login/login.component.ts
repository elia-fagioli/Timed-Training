import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from "@angular/router";

import {AuthService} from "../../shared/auth.service";
import {getAuth} from "@angular/fire/auth";
import {FirestoreService} from "../../shared/firestore.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
  //Form usato per i validators
  form: FormGroup;
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  email_verified: boolean = false;
  resetEmailSent: boolean = false;
  resetEmailMessage: string = "";

  errorMessage: string = "";
  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private router : Router,
              private firestore: FirestoreService) {
    this.form = this.fb.group({
      "email": ["", Validators.required],
      "password": ["", Validators.required]
    });
  }
  toggleShowPassword() {
    //mostra password in chiaro
    this.showPassword = !this.showPassword;
  }
  loginGoogle(){
    //richiesta di apertura form di login Google
    this.authService.loginGoogle()
      .then(() => {
          this.firestore.queryFieldExistsInCollection("users", "email", "faggio136@gmail.com");
          this.router.navigateByUrl('/').then(() => {
        });
      }).catch((error: any) => {
        console.error("Errore in fase di accesso tramite Google");
      });
  }

  loginWithEmailAndPassword() {
    this.email_verified = false;
    //invio dei contenuti del form come dati di accesso

    this.email = this.form.get('email')?.value;
    this.password=this.form.get('password')?.value;
    this.authService.signWithEmailAndPassword(this.email, this.password).then(() => {
      const user = getAuth().currentUser;
      if (user && user.emailVerified) {
        // L'account è stato verificato dopo il login
        this.router.navigateByUrl('/').then(() => {
        });
      } else {
        // L'account non è stato verificato
        this.email_verified=true;
      }
    }).catch((error: any) => {
      if(error.code === 'auth/user-not-found'){
        this.errorMessage = "Utente non registrato";
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = "Password errata. Riprova.";
      } else {
        this.errorMessage = "Dati di accesso non validi";
      }
    });
  }

  sendEmailReset(){
    //Invio di link di modifica password tramite firebase
    this.email=this.form.get('email')?.value;
    this.resetEmailSent = true;
    this.authService.sendPasswordResetEmail(this.email)
      .then(() => {
        this.resetEmailMessage = "Inviata email all'indirizzo inserito";
      })
      .catch(error => {
        this.resetEmailMessage = "Inserire un indirizzo valido";
      });
  }
}
