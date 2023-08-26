import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef,MatDialogConfig } from '@angular/material/dialog';
import { storeUserDetails } from '../localStorageService';
import { ApiService } from '../apiservice.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent {

  username: string = '';
  password: string = '';

  isLogin: boolean = true;
  erroMessage: string = "";

  constructor(private router: Router,private authService: AuthService,public dialog: MatDialog,private apiService: ApiService) {}

  login() {
    
    console.log(environment.apiUrl);

    let bodyData = {
      username: this.username,
      password: this.password,
    };

    this.apiService.loginUser(bodyData).subscribe(  (resultData: any) => {
        

        if (resultData.status) 
        {
          var user = resultData.userDetails;
          storeUserDetails(user)
          this.authService.setToken(resultData.token);
          this.dialog.closeAll();
          this.router.navigate(['/dashboard'])
    

        } 
        else
         {
          alert("Incorrect Email or Password");
          //console.log("Errror login");
        }
      });
    }

}