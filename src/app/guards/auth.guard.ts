import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.storageService.get('isLoggedIn');
    
    if (isLoggedIn) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
