import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  isLogin: boolean = true;
  erroMessage: string = "";

  constructor(private router: Router,private http: HttpClient,private authService: AuthService) {}

  login() {
    

    let bodyData = {
      email: this.email,
      password: this.password,
    };

        this.http.post("http://localhost:9002/student/login", bodyData).subscribe(  (resultData: any) => {
        

        if (resultData.status) 
        {
          this.authService.setToken(resultData.token);
           this.router.navigate(['/dashboard'])
    

        } 
        else
         {
          alert("Incorrect Email or Password");
          console.log("Errror login");
        }
      });
    }

}