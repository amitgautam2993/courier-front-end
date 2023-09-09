import { Component } from '@angular/core';
import { removeUserDetails } from '../localStorageService';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CustomSnackbarService } from '../custom-snackbar.service';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent {

constructor(private router: Router, private authService: AuthService,private customSnackbarService: CustomSnackbarService) {}
  goToProfile(): void {
   this.customSnackbarService.openSnackBar('Not Allowed, Please try again','info');
    // Implement logic to navigate to the user's profile page
  }

  logout() {
    removeUserDetails();
    this.authService.logout();
    this.router.navigate(['/home'])
  }

}
