import { Component,OnInit,EventEmitter,Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef,MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';




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

  constructor(private http: HttpClient,private dialogRef: MatDialogRef<ModalDashboardComponent>) {}
  @Output() getCards = new EventEmitter<any>();

onsubmit(){
  let bodyData = {
    Companyname: this.company,
    Ownername: this.owner,

    email: this.email,
    
    address: this.address

  };
  this.http.post("http://localhost:9002/companies/create", bodyData).subscribe((resultData: any) => {


      if (resultData.status) { 
        this.close();
        this.getCards.emit();
        

       }
      else {
        console.log(resultData)
        alert("Incorrect Email or Password");
        console.log("Errror login");
      }
    });
}


  close(): void {
    this.dialogRef.close();
  }

}