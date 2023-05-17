import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  firstname: string ="";
  lastname: string ="";
  email: string ="";
  password: string ="";

  constructor(private http: HttpClient,private router: Router) 
  {
  }

  ngOnInit(): void
  {
  }

  register()
  {
    let bodyData = 
    {
      "firstname" : this.firstname,
      "lastname" : this.lastname,
      "email" : this.email,
      "password" : this.password,
    };
    this.http.post("http://localhost:9002/student/create",bodyData).subscribe((resultData: any)=>
    {
       
        alert("Student Registered Successfully")
        this.router.navigateByUrl("/home")
    });
  }

  save()
  {
    this.register();
  }

}