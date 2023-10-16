import { Component } from '@angular/core';
import {AuthService} from "../../shared/auth.service";
import {Router} from "@angular/router";
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  hideNavbar = false;
  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit() {
    this.router.events.subscribe(() => {
      // Ottieni il percorso corrente
      const currentRoute = this.router.url;
      // Controlla se il percorso attuale è "/login"
      if ((currentRoute === '/login')||(currentRoute === '/registration')) {
        this.hideNavbar = true; // Nascondi il navbar
      } else {
        this.hideNavbar = false; // Mostra il navbar
      }
    });
  }
  setActiveNavItem(element: EventTarget | null) {
    if (element instanceof HTMLElement) {
      // Rimuovi la classe "active" da tutti gli elementi del menu
      const navItems = document.querySelectorAll('.nav-link');
      navItems.forEach(item => item.classList.remove('active'));
      // Aggiungi la classe "active" all'elemento corrente
      element.classList.add('active');
    }
  }
  get isLoggedIn(): boolean {
    //funzione per controllare se l'utente è connesso
    return this.authService.getStatus();
  }
  logout() {
    //logout dell'utente
    return this.authService.logout();
  }
}
