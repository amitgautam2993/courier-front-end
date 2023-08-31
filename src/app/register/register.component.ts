import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef,MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { CustomSnackbarService } from '../custom-snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;


  constructor(    private customSnackbarService: CustomSnackbarService,
    private fb: FormBuilder,private http: HttpClient,private router: Router,public dialog: MatDialog,private _snackBar: MatSnackBar) 
  {
    this.form = this.fb.group({
      organisation: ['', Validators.required],
      username:['',Validators.required],
      password:['',Validators.required],
      cpassword:['',Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postalcode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      branchcode: ['', Validators.required]
    }, { validator: this.passwordMatchValidator })
  }
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('cpassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword!.setErrors(null);
    }
  }
  ngOnInit(): void
  {
  }

  register()
  {
    console.log('register')
    let bodyData = 
    {
      organisation: this.form.value.organisation.toUpperCase(),
      firstname: this.form.value.firstname.toUpperCase(),
      lastname: this.form.value.lastname.toUpperCase(),
      address: this.form.value.address.replace(/\n/g, ' ').toUpperCase(),
      city: this.form.value.city.toUpperCase(),
      state: this.form.value.state.toUpperCase(),
      postalcode: this.form.value.postalcode.toUpperCase(),
      country: this.form.value.country.toUpperCase(),
      email: this.form.value.email.toUpperCase(),
      branchcode: this.form.value.branchcode.toUpperCase(),
      password:this.form.value.password,
      username:this.form.value.username
    };
    this.http.post("/student/create",bodyData).subscribe((resultData: any)=>
    {
     
        this.dialog.closeAll();

        this.customSnackbarService.openSnackBar(resultData.message, 'success');

        // this._snackBar.open(resultData.message, 'Dismiss', {
        //   duration: 3000
        // });

       // this.router.navigateByUrl("/home")
    },(error)=>{
    
      this.customSnackbarService.openSnackBar(error.error.message, 'error');

        // this._snackBar.open(error.error.message, 'Dismiss', {
        //   duration: 3000
        // });
     
    });
  }

  save()
  {
    if (this.form.invalid ) 
    {
      this.customSnackbarService.openSnackBar('Please fill in all the required fields', 'info');

      // this._snackBar.open('Please fill in all the required fields', 'Dismiss', {
      //   duration: 4000
      // });
    }
else {
  //if(this.form.value.password==this.form.value.cpassword){
    this.register();
  
}
    
  }

}