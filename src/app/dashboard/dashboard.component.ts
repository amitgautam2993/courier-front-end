import { Component,OnInit,EventEmitter,Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef,MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { removeUserDetails } from '../localStorageService';
import { getUserDetails } from '../localStorageService';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers:[AuthGuard]
})
export class DashboardComponent implements OnInit {
  showCustomSpinner = true;
  header: string='';

backtodashboard() {
throw new Error('Method not implemented.');
}

isCardHovered: boolean = false;

onCardHover(isHovered: boolean): void {
  this.isCardHovered = isHovered;
}
  loading = false;

   async ngOnInit() {
    this.header=`${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}`

    //await new Promise(resolve => setTimeout(resolve, 1000));
    this.getCards();

  }
   async getCards() {
    this.loading=true
    const abc=getUserDetails()
    //console.log(abc)
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.http.get<any>(`http://localhost:9002/companies/get?username=${getUserDetails().username}`).subscribe(data => {
      if(data.length!=0){
      this.cards = data[0].companies;      
      this.filteredCards = data[0].companies;}
      else{
      this._snackBar.open('Please Start Adding Company','Dismiss',{
        duration:3000
      })}
    });
    this.loading = false;

  }
  cards:any[]=[]
 
  searchQuery: any;
  filteredCards = this.cards;

  constructor(private _snackBar: MatSnackBar,private router: Router,private authService: AuthService,public dialog: MatDialog,private http: HttpClient){}

  onEditClick(data: any){
    this._snackBar.open('Not Allowed Please Contact Admin', 'Dismiss', {
      duration: 3000
    });

  
  }
  ondeleteClick(data: any){
    this._snackBar.open('Not Allowed Please Contact Admin', 'Dismiss', {
      duration: 3000
    });

  }
  //logout
  logout() {
  removeUserDetails();
  this.authService.logout();
  this.router.navigate(['/home'])
}
  
  //search
  searchCards(event: any): void {
    this.filteredCards = this.cards.filter(card =>
      card.Companyname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      card.Ownername.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }
  
  //company click
  onCardClick(card: any) {
   

this.router.navigate(['/cards', card._id],{ state: { 'cardData': card }});
  }

  //Function to open modal
  openAddCardDialog() {

    this.dialog.open(ModalDashboardComponent,{
      autoFocus:false,
      height:'610px',
      width:'500px',
      panelClass:[],
      data:{

      }
    }).afterClosed().subscribe(res=>{
              if(res.status==200){
              //console.log(`Dialog result: ${res}`);
              this.getCards();}

    })
    // const dialogRef = this.dialog.open(ModalDashboardComponent);
    
    //   dialogRef.afterClosed().subscribe(result => {
    //     console.log(`Dialog result: ${result}`);
    //   });
  }

}
//modal
@Component({
  selector: 'modal-dashboard.component',
  templateUrl: './modal-dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

// export class ModalDashboardComponent{
// email: string='';
// owner:string='';
// company:string='';
// address:string='';
// shippercode:string='';

//   constructor(private _snackBar: MatSnackBar,private http: HttpClient,private dialogRef: MatDialogRef<ModalDashboardComponent>) {}
//   @Output() getCards = new EventEmitter<any>();

// onsubmit(){
//   let bodyData = {
//     Companyname: this.company,
//     Ownername: this.owner,

//     email: this.email,
    
//     address: this.address,
//     shippercode:this.shippercode

//   };
//   this.http.post("http://localhost:9002/companies/create", bodyData).subscribe((resultData: any) => {

//   console.log('Status:', resultData.status);
//       if (resultData.status==200) { 
//         this._snackBar.open(resultData.message, 'Dismiss',{
//           duration: 3000
//         });
//         this.close();
//         this.getCards.emit();
//        }
//       if (resultData.status==400){
//         this._snackBar.open(resultData.message, 'Dismiss',{
//           duration: 4000
//         });     
         
//       }
//       else{
        
//         this._snackBar.open(resultData.message, 'Dismiss',{
//           duration: 4000
//         });     
//       }
//     },(error)=>{
//       if (error.status === 400) {
//         // Handle error scenario (status 400)
//         this._snackBar.open(error.error.message, 'Dismiss',{
//           duration: 4000,
//       //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
//       // verticalPosition: 'top',
//       panelClass: ['custom-snackbar']
//         });  
//       } else {
//         // Handle other error scenarios (status 500, 404, etc.)
        
//         this._snackBar.open(error.error.message, 'Dismiss',{
//           duration: 4000,
         
//         });  
//       }
//     });
// }


//   close(): void {
//     this.dialogRef.close();
//   }

// }
export class ModalDashboardComponent{
  form: FormGroup;

  constructor(
    private _snackBar: MatSnackBar,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ModalDashboardComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      company: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postalcode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      shippercode: ['', Validators.required]
    });
  }

  @Output() getCards = new EventEmitter<any>();

  onsubmit() {
    if (this.form.invalid || this.form.value.company === '' || this.form.value.firstname === '' || this.form.value.email === '' || this.form.value.address === '' || this.form.value.shippercode === '') {
      // Display an error message for empty or invalid fields
      this._snackBar.open('Please fill in all the required fields', 'Dismiss', {
        duration: 4000
      });
      return;
    }

    const bodyData = {
      company: this.form.value.company.toUpperCase(),
      firstname: this.form.value.firstname.toUpperCase(),
      lastname: this.form.value.lastname.toUpperCase(),
      address: this.form.value.address.replace(/\n/g, ' ').toUpperCase(),
      city: this.form.value.city.toUpperCase(),
      state: this.form.value.state.toUpperCase(),
      postalcode: this.form.value.postalcode.toUpperCase(),
      country: this.form.value.country.toUpperCase(),
      email: this.form.value.email.toUpperCase(),
      shippercode: this.form.value.shippercode.toUpperCase(),

    };

    this.http.post(`http://localhost:9002/companies/create/${getUserDetails().username}`, bodyData).subscribe(
      (resultData: any) => {
       // console.log(bodyData)
        //console.log('Status:', resultData.status);
        if (resultData.status == 200) {
          this._snackBar.open(resultData.message, 'Dismiss', {
            duration: 3000
          });
          this.dialogRef.close(resultData); // Pass the response data to the parent component
          //this.getCards.emit();
        } else if (resultData.status == 400) {
          this._snackBar.open(resultData.message, 'Dismiss', {
            duration: 4000
          });
        } else {
          this._snackBar.open(resultData.message, 'Dismiss', {
            duration: 4000
          });
        }
      },
      (error) => {
        if (error.status === 400) {
          // Handle error scenario (status 400)
          this._snackBar.open(error.error.message, 'Dismiss', {
            duration: 3000,
            panelClass: ['custom-snackbar']
          });
        } else {
          // Handle other error scenarios (status 500, 404, etc.)
          this._snackBar.open(error.error.message, 'Dismiss', {
            duration: 3000
          });
        }
      }
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}