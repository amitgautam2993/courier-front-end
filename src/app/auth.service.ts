import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string {
    const token = localStorage.getItem(this.tokenKey);
    return token as string; // using type assertion
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    // check if token is valid
    return !!token;
  }
  logout() {
    // remove token from local storage
    localStorage.removeItem(this.tokenKey);
    // navigate to login page

  }
}
