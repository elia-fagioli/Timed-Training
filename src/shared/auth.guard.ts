import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router, CanActivate
} from '@angular/router';
import {AuthService} from "./auth.service";
@Injectable({
  providedIn: 'root',
})
export class authGuard implements CanActivate{
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    //verifica se l'utente è autenticato
    if (!this.authService.isLoggedIn) {
      //console.log('Richiesto il login per accedere al contenuto');
      this.router.navigate(['/login']).then();
      return false;
    }
    return true;
  }
}
