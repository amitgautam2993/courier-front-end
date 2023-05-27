import { Component,OnInit,EventEmitter,Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef,MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers:[AuthGuard]
})
export class DashboardComponent implements OnInit {
backtodashboard() {
throw new Error('Method not implemented.');
}

isCardHovered: boolean = false;

onCardHover(isHovered: boolean): void {
  this.isCardHovered = isHovered;
}
  loading = false;

   async ngOnInit() {
    //await new Promise(resolve => setTimeout(resolve, 1000));
    this.getCards();

  }
   async getCards() {
    this.loading=true

    await new Promise(resolve => setTimeout(resolve, 1000));

    this.http.get<any>('http://localhost:9002/companies/get').subscribe(data => {
      this.cards = data;
      this.filteredCards = data;
    });
    this.loading = false;

  }
  cards:any[]=[]
 
  searchQuery: any;
  filteredCards = this.cards;

  constructor(private router: Router,private authService: AuthService,public dialog: MatDialog,private http: HttpClient){}

  onEditClick(data: any){
    console.log(data)
  
  }
  //logout
  logout() {
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
      height:'500px',
      width:'500px',
      panelClass:[],
      data:{

      }
    }).afterClosed().subscribe(res=>{
              console.log(`Dialog result: ${res}`);
              this.getCards();

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

export class ModalDashboardComponent{
email: string='';
owner:string='';
company:string='';
address:string='';

  constructor(private _snackBar: MatSnackBar,private http: HttpClient,private dialogRef: MatDialogRef<ModalDashboardComponent>) {}
  @Output() getCards = new EventEmitter<any>();

onsubmit(){
  let bodyData = {
    Companyname: this.company,
    Ownername: this.owner,

    email: this.email,
    
    address: this.address

  };
  this.http.post("http://localhost:9002/companies/create", bodyData).subscribe((resultData: any) => {

  console.log('Status:', resultData.status);
      if (resultData.status==200) { 
        this._snackBar.open(resultData.message, 'Dismiss',{
          duration: 3000
        });
        this.close();
        this.getCards.emit();
       }
      if (resultData.status==400){
        this._snackBar.open(resultData.message, 'Dismiss',{
          duration: 4000
        });     
         
      }
      else{
        
        this._snackBar.open(resultData.message, 'Dismiss',{
          duration: 4000
        });     
      }
    },(error)=>{
      if (error.status === 400) {
        // Handle error scenario (status 400)
        this._snackBar.open(error.error.message, 'Dismiss',{
          duration: 4000,
      //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
      // verticalPosition: 'top',
      panelClass: ['custom-snackbar']
        });  
      } else {
        // Handle other error scenarios (status 500, 404, etc.)
        
        this._snackBar.open(error.error.message, 'Dismiss',{
          duration: 4000,
         
        });  
      }
    });
}


  close(): void {
    this.dialogRef.close();
  }

}