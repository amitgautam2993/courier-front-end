import { Component,OnInit,EventEmitter,Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { removeUserDetails, getUserDetails } from '../localStorageService';
import { ApiService } from '../apiservice.services';
import { CustomSnackbarService } from '../custom-snackbar.service';

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

    this.getCards();

  }
   async getCards() {
    this.loading=true
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.apiService.getCompanies(getUserDetails().username).subscribe(data =>{
      if(data.length!=0){
      this.cards = data[0].companies;      
      this.filteredCards = data[0].companies;}
      else{
        this.customSnackbarService.openSnackBar('Please Start Adding Company', 'info');
   
    }

    });
    this.loading = false;

  }
  cards:any[]=[]
 
  searchQuery: any;
  filteredCards = this.cards;

  constructor(    private customSnackbarService: CustomSnackbarService,
    private apiService: ApiService,private _snackBar: MatSnackBar,private router: Router,private authService: AuthService,public dialog: MatDialog,private http: HttpClient){}

  onEditClick(data: any){
    this.customSnackbarService.openSnackBar('Not Allowed Please Contact Admin', 'info');


  
  }
  ondeleteClick(data: any){
    this.customSnackbarService.openSnackBar('Not Allowed Please Contact Admin', 'info');


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
      height:'650px',
      width:'500px',
      panelClass:[],
      data:{

      }
    }).afterClosed().subscribe(res=>{
              if(res.status==200){
              this.getCards();}

    })

  }

}
//modal
@Component({
  selector: 'modal-dashboard.component',
  templateUrl: './modal-dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class ModalDashboardComponent{
  form: FormGroup;

  constructor(
    private customSnackbarService: CustomSnackbarService,
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
      this.customSnackbarService.openSnackBar('Please fill in all the required fields', 'info');
   
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

    this.http.post(`/companies/create/${getUserDetails().username}`, bodyData).subscribe(
      (resultData: any) => {
   
        if (resultData.status == 200) {
          this.customSnackbarService.openSnackBar(resultData.message, 'success');
      
          this.dialogRef.close(resultData); // Pass the response data to the parent component
        } else if (resultData.status == 400) {
          this.customSnackbarService.openSnackBar(resultData.message, 'error');
    
        } else {
          this.customSnackbarService.openSnackBar(resultData.message, 'error');
  
        }
      },
      (error) => {
        if (error.status === 400) {
          // Handle error scenario (status 400)
          this.customSnackbarService.openSnackBar(error.error.message, 'info');

        } else {

          // Handle other error scenarios (status 500, 404, etc.)
          this.customSnackbarService.openSnackBar(error.error.message, 'error');

        }
      }
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}