import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog} from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router,public dialog: MatDialog){}
singup() {

  this.dialog.open(RegisterComponent,{
    autoFocus:false,
    height:'710px',
    width:'500px',
    panelClass:[],
    data:{

    }
  })
 

//this.router.navigateByUrl("/register")
}
login() {
  this.dialog.open(LoginComponent,{
    autoFocus:false,
    height:'300px',
    width:'300px',
    panelClass:[],
    data:{

    }
  })
  this.dialog.closeAll

}

}
