import { Component,OnInit,Inject,HostListener,ElementRef,AfterViewInit,ViewChild,Renderer2,AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup,FormControl,Validators } from '@angular/forms';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef,MatDialogConfig,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { TDocumentDefinitions } from "pdfmake/interfaces";
//import {FocusDirective} from '../directives/autofocus/autofocus.directive'
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { removeUserDetails } from '../localStorageService';
import { getUserDetails } from '../localStorageService';
import * as moment from 'moment';
import 'moment-timezone';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;





@Component({
  selector: 'app-company-details-component',
  templateUrl: './company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})
export class CompanyDetailsComponentComponent implements OnInit {

dateRange!: FormGroup;
dummyData: any[] = [];
pageSize = 10;
pageSizeOptions = [5, 10, 25, 100];
currentPage = 0;
sortOrder: 'asc' | 'desc' = 'asc';
searchTerm = '';
filteredData: any[] = [];
cardData: any;
data: any;
selectedRow: any;
isHovered = false;
dataFound!: boolean
shippercode:string=''
header:string=''
monthYear:string=''
year:any
month:any
monthNumber:any
date:any
  newInvoiceNumber: any;
//constructor
  constructor(private _snackBar: MatSnackBar,private http: HttpClient,public dialog: MatDialog,private route: ActivatedRoute,private router: Router,private formBuilder: FormBuilder,private authService: AuthService,private datePipe: DatePipe) {
    this.searchTerm = '';

  }

//ngOnInitpd
  ngOnInit() {
    // this.header=getUserDetails().fname
    this.header=`${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}`
    
    // console.log(amountInWords)
    this.cardData = history.state['cardData'];
    //console.log(this.cardData)
    this.shippercode=history.state['cardData'].shippercode;
   // console.log(this.shippercode)
   const currentDate = new Date();

   //console.log(currentDate) // Get the current date
const currentYear = currentDate.getFullYear(); // Get the current year
const currentMonth = currentDate.getMonth() + 1;
    this.dateRange = this.formBuilder.group({
      fromDate: '',
      toDate: ''
    });
  
    // this.dateRange.valueChanges.subscribe(value => {
    //   console.log('Selected date range: ', value.fromDate.toISOString(), ' to ', value.toDate.toISOString());
    //   // you can use the selected dates here
    //   this.dummyData = this.generateDummyData(value.fromDate, value.toDate, 5);
    //   console.log(this.dummyData[0].date)
    //   this.filterData();
    // });
    this.dateRange.valueChanges.subscribe(value => {
    console.log('Selected date range: ', value.fromDate.toLocaleDateString(), ' to ', value.toDate.toLocaleDateString());
      //console.log(value.fromDate.toISOString())
      // Make an API call with the selected dates

      const fromDateT = moment(value.fromDate).tz('your-time-zone').startOf('day');
      const toDateT = moment(value.toDate).tz('your-time-zone').endOf('day');
      const fromDate = fromDateT.toISOString();
      const dateObject = new Date(fromDate); // Create a Date object from the fromDate string
      this.date=fromDateT.format('DD');
       this.year = fromDateT.format('YYYY'); // Get the year from the Date object
      this.month = fromDateT.format('MMM'); // Get the month as a character
      this.monthNumber  = fromDateT.format('MM');// get the month as a number
      this.monthYear=`${this.month} ${this.year}`
      //console.log(this.monthYear)
      const toDate =toDateT.toISOString();

    
     
      // Construct the API endpoint with query parameters
      const endpoint = `http://localhost:9002/courierdata/daterange/${this.shippercode}?from=${fromDate}&to=${toDate}`;
    
      // Make the API call using the Angular Router
      this.http.get<any>(endpoint).subscribe(data => {
     // console.log(data.data.courierDetails) 
         
      this.dataFound=true; 
      this.dummyData= data.data.courierDetails
      this.filterData();
      },(error:any)=>{
        if(error.status==404){
          this.dummyData=[]
          this.dataFound=false; 
          this.filterData();

          this._snackBar.open(error.error.message, 'Dismiss',{
            duration: 4000,
        //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
        // verticalPosition: 'top',
        panelClass: ['custom-snackbar']
          });  
        }
        else {
          // Handle other error scenarios (status 500, 404, etc.)
          this.dataFound=false; 

          this._snackBar.open(error.error.message, 'Dismiss',{
            duration: 4000,
           
          });  
        }
        //console.log('Error Fetching data:')
      });
    
    });
    
    
  
    // Initialize searchTerm to empty string if it is undefined
    this.searchTerm = this.searchTerm || '';
    this.filterData();
    //this.newInvoiceNumber = this.generateInvoiceNumber();
  }
  
   generateInvoiceNumber() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const date = currentDate.getDate().toString().padStart(2, '0');
    const invoiceNumber = `${year}${month}${date}-${this.cardData.shippercode}`;
    return invoiceNumber;
  }
  onRowHover(record: any, isHovered: boolean) {
    if (isHovered) {
      this.selectedRow = record;
    } else {
      this.selectedRow = null;
    }
  }

  onRowClicked(record: any) {
    this.selectedRow = record;
  }
  //refresh function
refresh() {
  window.location.reload();
}

// create function


//logout function
logout() {
  removeUserDetails();
  this.authService.logout();
  this.router.navigate(['/home'])
}

//searchData function
searchData() {
  this.filteredData = this.dummyData.filter(record => {
    return record.cnumber.includes(this.searchTerm);
  });
}

//generatePDF
generatePDF() {
  this.getDisplayedIdSum();
  // Define the document definition
  const documentDefinition: TDocumentDefinitions = {
    content: [
      {
        text: `${this.monthYear}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: `${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}`
        ,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `${getUserDetails().address.toUpperCase()}, ${getUserDetails().city.toUpperCase()}-${getUserDetails().postalcode}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: `EMAIL: ${getUserDetails().email.toUpperCase()}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: 'INVOICE',
        style: 'subheader',
        alignment: 'center',
        bold: true,
        fontSize: 15,
        margin: [0, 5, 0, 5],
      },
      {
        alignment: 'justify',
        columns: [
          {
            text: [`${this.cardData.company}\n${this.cardData.address} \n${this.cardData.city} - ${this.cardData.postalcode}\nPAGE: 1`],
            alignment: 'left',
          },
          {
            text: [`INVOICE: ${this.year+this.monthNumber+this.date+this.cardData.shippercode}\nBRANCH CODE: ${getUserDetails().branchcode}\n SHIPPER CODE: ${this.cardData.shippercode}\nPERIOD: `,{text:`${this.year}`}],
            alignment: 'right',
          },
        ],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }],
      },
      {	style: 'tableExample',
			alignment:'center',
			
        table: {
          headerRows: 1, 
          body: [
            ['S.NO.', 'C/N NO.', 'DATE','DEST', 'TYPE', 'PC','RATE', 'WEIGHT', 'AMOUNT',],
            ...this.dummyData.map((data,index) => [index + 1, data.cnumber, this.datePipe.transform(data.date, 'MM/dd/yyyy'),  data.destination,data.type,data.pc,data.rate+'/-',data.weight+'Kg',data.amount+'.00']),
          ],
          widths: ['auto', 90, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 50]
        },layout: 'lightHorizontalLines'
      },
      {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 2 }]
		    
		},
		{			fontSize:10,text:['GROSS TOTAL : ',{text:this.totalamountNumber},'.00'],
		            alignment:'right',
		            margin:[0,3,2,3],
		            bold:true
},
		{canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 2 }]
		    
		},
		{   fontSize:10,
		    text:['TOTAL NO. OF PACKET : ',{text:this.totalpacket,bold:true,fontSize:10}],
		    margin:[0,5,0,0],
		   
		    
		},
			{fontSize:10,
			alignment: 'justify'
			
,			columns: [
				{
					text:['Ruppes GROSS TOTAL : ',{text: this.totalamountWords+' ONLY',bold:true,fontSize:10}]
					
					
					
				},
				
				{
					text: ['BILLING AMOUNT : ',{text:this.totalamountNumber, bold:true},{text:'.00',bold:true}],
					alignment:'right'
					
				}
			]
		},
    {
      // text:['FOR : ',{text:this.cardData.firstname +' '+ this.cardData.lastname }],
      text:['FOR : ',{text:getUserDetails().firstname.toUpperCase() +' '+ getUserDetails().lastname.toUpperCase(),bold:true }],
      alignment:'right',
      margin:[0,10,0,0],
      
  },
  {
      text:'Authorized Signatory',
      alignment:'right',
      margin:[0,40,0,0]
  },
  {text: 'Term & Condition',bold:true},
  {
    ul: ['Payment should be made to authorized to officer only against official receipt.',
      `Please pay by cheque/draft in favour of ${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}.`,
      'Payment should be made within 7 days from the date of bill.',
      'Late payments are subject to an interest charges 2% per month.',
      'All disputes subject to Delhi junction',
      
      
    ]
  }
    ],
    styles: {
      subheader: {
        fontSize: 10,
      },
      header: {
        fontSize: 40,
        bold: true,
      },
      columns: {
        margin: [4, 4, 4, 4],
      },
      tableExample: {
        margin: [3, 10, 0, 0],
      },
    },
    footer: (currentPage, pageCount) => {
      return {
        text: `Page ${currentPage.toString()} of ${pageCount.toString()}`,
        alignment: 'right',
        margin: [10, 20],
      };
    }
  };

  // Generate the PDF and provide a download link
  pdfMake.createPdf(documentDefinition).print();
}

totalpacket:any
totalamountWords:any
totalamountNumber:any
// totalpacketInt:number=0
// totalamountWordsInt:number=0
// totalamountNumberInt:number=0
//getDisplayedIdSum function
getDisplayedIdSum() {
  var upperString=''
  //console.log(this.filteredData.reduce((acc, curr) => acc + curr.pc, 0))
  this.totalpacket= this.filteredData.reduce((acc, curr) => acc + curr.pc, 0);
  const numWords = require('num-words')
  upperString = numWords(this.filteredData.reduce((acc, curr) => acc + curr.amount, 0));
  this.totalamountWords=upperString.toUpperCase();
  this.totalamountNumber= this.filteredData.reduce((acc, curr) => acc + curr.amount, 0);


}

//onSearch function
onSearch() {
  this.searchData();
}
  

// sortData function
sortData() {
  if (this.sortOrder === 'asc') {
    this.dummyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.sortOrder = 'desc';
  } else {
    this.dummyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.sortOrder = 'asc';
  }
}

// back button function
  backtodashboard() {
  this.router.navigate(['/dashboard'])

}


 
  //  filterData function
  filterData() {
    if (this.searchTerm) {
      this.filteredData = this.dummyData.filter(data =>
        data.cnumber.includes(this.searchTerm)
      );
    } else {
      this.filteredData = this.dummyData
    }
  
  }

  //dummy data function

  // generateDummyData(fromDate: string, toDate: string, numRecords: number): any[] {
  //   const data: any[] = [];
  //   const startDate = new Date(fromDate);
  //   const endDate = new Date(toDate);
  
  //   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  //     console.error('Invalid date format');
  //     return data;
  //   }
  
  //   for (let i = 0; i < numRecords; i++) {
  //     const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  //     const record = {
  //       id: i + 1,
  //       date: date,
  //       cnumber: Math.floor(Math.random() * 1000000000) + 1+`${i + 1}`,
  //       destination: (Math.random() + 1).toString(36).substring(9),
  //       type: (Math.random() + 1).toString(36).substring(9),
  //       pc: Math.floor(Math.random() * 100) + 1,
  //       rate: Math.floor(Math.random() * 1000) + 1,
  //       weight: Math.floor(Math.random() * 1000) + 1,
  //       amount: Math.floor(Math.random() * 10000) + 1,
        
  //     };
  //     data.push(record);
  //   }
  
  //   // Sort the data by date
  //   data.sort((a, b) => {
  //     return a.date.getTime() - b.date.getTime();
  //   });
  
  //   return data;
  // }

  



  editModal(record:any){
    
    
    //console.log(record)
    this.dialog.open(editModalComapnyDetailComponent,{
      autoFocus:true,
      height:'400px',
      width:'500px',
      panelClass:[],
      disableClose:true,
      data: record // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res=>{
      //console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
  }
  
  createModal(){

    this.dialog.open(createModalComapnyDetailComponent,{
      
      height:'400px',
      width:'500px',
      panelClass:[],
      data: this.shippercode
      // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res=>{
      window.location.reload();
      //console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
  }
  
  trackModal(record:any){
    this.dialog.open(trackingModalComapnyDetailComponent,{
      disableClose:true,
      height:'700px',
      width:'500px',
      panelClass:[],
      data: record,
      // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res=>{
      window.location.reload();
      //console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
  }

  deleteModal(record:any){
    this.dialog.open(deleteModalComapnyDetailComponent,{
      autoFocus:true,
      maxHeight:'315px',
      width:'380px',
      panelClass:[],
      disableClose:true,
      data: record 
    }).afterClosed().subscribe(res=>{
      ///console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
  }
}
@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './delete-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})
export class deleteModalComapnyDetailComponent  {
  cnumber:string=''
  constructor(@Inject(MAT_DIALOG_DATA) public data:any){

    this.cnumber=data.cnumber
  }

}

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './tracking-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})




export class trackingModalComapnyDetailComponent implements OnInit{
  trackingData: any;
  isLoading!: boolean;
  cnumber:String='';
  destinationExpanded: boolean = false;
  originExpanded: boolean = false;
  trackExpanded:boolean=true
  showCustomSpinner = true;
  couriercode:string='';
  constructor(private http: HttpClient,public dialogRef: MatDialogRef<trackingModalComapnyDetailComponent>,@Inject(MAT_DIALOG_DATA) public data: any){
  this.cnumber=data.cnumber,
  this.couriercode= data.couriercode
  }
  
  toggleDestination() {
    this.destinationExpanded = !this.destinationExpanded;
  }

  toggleOrigin() {
    this.originExpanded = !this.originExpanded;
  }
  toggleTrack(){
    this.trackExpanded=!this.trackExpanded;
  }
  ngOnInit(){
    this.isLoading = true;
    let bodyData = {
      "tracking_number": this.cnumber,
      "carrier_code": this.couriercode
      // "tracking_number": "d38418282",
      // "carrier_code": "dtdc"
    };
//console.log(bodyData)
    this.http.post("http://localhost:9002/api/trackings/realtime", bodyData)
      .subscribe(
        (response) => {
          // Handle the response here
          this.trackingData=response
          this.isLoading = false;
          //console.log(this.trackingData);

        },
        (error) => {
          this.isLoading = false;
          // Handle errors here
          console.error(error);
        }
      );
  }

  onCancelClick(){
    this.dialogRef.close();

  }

    }      
    
  



//MODAL

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './edit-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})
export class editModalComapnyDetailComponent implements OnInit{
  form: FormGroup;
  formattedDate: string = '';

  constructor(public dialogRef: MatDialogRef<editModalComapnyDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, private datePipe: DatePipe
  ) { 
    this.form = this.fb.group({
    
      date: [this.data.date],
      cnumber: [this.data.cnumber],
      destination: [this.data.destination],
      type: [this.data.type],
      pc: [this.data.pc],
      rate: [this.data.rate],
      weight: [this.data.weight],
      amount: [this.data.amount],
    });
  }

  
  ngOnInit(): void {
    console.log(this.data._id)
    this.formattedDate = this.datePipe.transform(this.data.date, 'dd/MM/yyyy') || '';

    this.form.patchValue({
      id: this.data.id || '',
      date: this.data.date||'',
      cnumber: this.data.cnumber || '',
      destination: this.data.destination || '',
      type: this.data.type || '',
      pc: this.data.pc || '',
      rate: this.data.rate || '',
      weight: this.data.weight || '',
      amount: this.data.amount || '',
    });
  }
  

  onCancelClick(){

    this.dialogRef.close();
  }
  onSaveClick() {
    const updatedRecord = this.form.value;
    //console.log(updatedRecord);
    this.dialogRef.close(updatedRecord);
  }
}

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './create-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})


// export class createModalComapnyDetailComponent implements OnInit {
//   dateControl!: FormControl;
//   form!: FormGroup;
//   destinationControl!: FormControl;
//   availableDestinations: string[] = ['Destination 1', 'Destination 2', 'Destination 3']; // Replace with your actual options

//   constructor(
//     private formBuilder: FormBuilder,
//     private dialogRef: MatDialogRef<createModalComapnyDetailComponent>,
//     private datePipe: DatePipe
//   ) { }

//   ngOnInit(): void {
    
//     this.dateControl = new FormControl(new Date(), Validators.required);
//     this.destinationControl = new FormControl('', Validators.required);
    

//     this.form = this.formBuilder.group({
//       date: this.dateControl,
//       cnumber: ['', Validators.required],
//       destination: this.destinationControl,
//       type: ['', Validators.required],
//       pc: ['', Validators.required],
//       rate: ['', Validators.required],
//       weight: ['', Validators.required],
//       amount: ['', Validators.required],
//     });
  
  
//   }

//   onCancelClick(): void {
//     this.dialogRef.close();
//   }

//   onSaveClick(): void {
//     if (this.form.invalid) {
//       // Form has errors, handle accordingly (e.g., show error message)
//       return;
//     }

//     const updatedRecord = this.form.value;
//     console.log(updatedRecord);
//     this.form.reset();
//     // this.dialogRef.close(updatedRecord);
//   }
// }
export class createModalComapnyDetailComponent implements AfterViewInit {
  shippercode:String=''
  dateControl!: FormControl;
  availableType: string[] = ['NDOX','DOX'];
  availableCourierCode:string[]=['dtdc','trackon','bluedart'];
  availableDestinations: string[] = ['BOM', 'DEl','TMN','UKD','HIM','JOD', 'BAN','CHE','SUR','RAJ','JAI','COI','PAT','PUN','HYD','AHM','THI','MAN','VAD','KNP','TRI','IND','COC','KOL','AMR','BHO','MAL','RAI','GUW','LUC','THR','BHU','VAR','CAL','VIZ','SRI','PAL','KOT','KAN','AUR','RAN','DIL','JAM','SHI'];
  @ViewChild('input1') input1!: ElementRef<HTMLInputElement>;
  @ViewChild('input2') input2!: ElementRef<HTMLInputElement>;
  @ViewChild('input3') input3!: ElementRef<HTMLInputElement>;
  @ViewChild('input4') input4!: ElementRef<HTMLInputElement>;
  @ViewChild('input5') input5!: ElementRef<HTMLInputElement>;
  @ViewChild('input6') input6!: ElementRef<HTMLInputElement>;
  @ViewChild('input7') input7!: ElementRef<HTMLInputElement>;
  @ViewChild('input8') input8!: ElementRef<HTMLInputElement>;
  @ViewChild('input10') input10!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {

    this.addEventListeners();
    
  }
  

  addEventListeners(): void {


  this.input1.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (this.input1.nativeElement.value) {
      this.input2.nativeElement.focus();
      this.input2.nativeElement.select();
    }
  }
});

this.input1.nativeElement.addEventListener('focusout', () => {
  // Convert the value to uppercase
  const uppercaseValue = this.input1.nativeElement.value.toUpperCase();

  // Update the field with the uppercase value
  this.input1.nativeElement.value = uppercaseValue;
});

this.input3.nativeElement.addEventListener('focusout', () => {
  // Convert the value to uppercase
  const uppercaseValue = this.input3.nativeElement.value.toUpperCase();

  // Update the field with the uppercase value
  this.input3.nativeElement.value = uppercaseValue;
});
this.input4.nativeElement.addEventListener('focusout', () => {
  // Convert the value to uppercase
  const uppercaseValue = this.input4.nativeElement.value.toUpperCase();

  // Update the field with the uppercase value
  this.input4.nativeElement.value = uppercaseValue;
});

    this.input2.nativeElement.addEventListener('input', (event: Event) => {
      const inputValue: string = this.input2.nativeElement.value;
      if (inputValue.length === 2 && parseInt(inputValue) > 12) {
        this.input2.nativeElement.value = '0' + inputValue + '/';
        this.input2.nativeElement.selectionStart = 3;
        this.input2.nativeElement.selectionEnd = 3;
      } else if (inputValue.length === 4 && !inputValue.includes('/', 2)) {
        const month = inputValue.substring(0, 2);
        const day = inputValue.substring(2, 4);
        this.input2.nativeElement.value = month + '/' + day + '/';
        this.input2.nativeElement.selectionStart = 6;
        this.input2.nativeElement.selectionEnd = 6;
      }
    });
  
    this.input2.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        // Assuming `input3` is the desired input field to focus on next
        this.input3.nativeElement.focus();
      }
    });

    this.input3.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.input3.nativeElement.value) {
          this.input4.nativeElement.focus();
        } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
      
    });
    this.input4.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.input4.nativeElement.value) {
          this.input5.nativeElement.focus();
          this.input5.nativeElement.select();

        } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
    this.input5.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        const inputValue = this.input5.nativeElement.value;
        const pattern = /^\d+$/; 
        if (inputValue && pattern.test(inputValue)) {
        this.input6.nativeElement.focus();
        this.input6.nativeElement.select();

      } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
    this.input6.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const inputValue = this.input6.nativeElement.value;
        const pattern = /^\d+$/; // Regular expression to match only numbers
      
        if (inputValue && pattern.test(inputValue)) {
          this.input7.nativeElement.focus();
          this.input7.nativeElement.select();
        }
      }
    });
    this.input7.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        const inputValue = this.input7.nativeElement.value;
        const pattern = /^\d+(\.\d+)?$/;
        if (inputValue && pattern.test(inputValue)) {
        this.input8.nativeElement.focus();
      } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });

    this.input8.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        if (this.input8.nativeElement.value) {
        this.input10.nativeElement.focus();
      } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
    // this.input8.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
    //   if (event.key === 'Enter') {

    //     event.preventDefault();
    //     if (this.input8.nativeElement.value) {
    //     this.input9.nativeElement.focus();
    //   } // Optionally, you can blur the last input field
    //     // Perform any additional actions here
    //   }
    // });
    // this.input10.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
    //   if (event.key === 'Enter') {

    //     event.preventDefault();
    //     this.onSaveClick();
        
    //     this.input1.nativeElement.focus();
    //    // Optionally, you can blur the last input field
    //     // Perform any additional actions here
    //   }
    // });
  }

  // attachSaveClickListener(): void {
  //   this.input10.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
  //     if (event.key === 'Enter') {
  //       event.preventDefault();
  //       this.onSaveClick();

  //       this.input1.nativeElement.focus();
       
  //     }
  //   });
  // }

  form: FormGroup;
  constructor(
    private _snackBar: MatSnackBar,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    public dialogRef: MatDialogRef<createModalComapnyDetailComponent>,
    private elementRef: ElementRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {
    this.shippercode=data
    this.dateControl = new FormControl(new Date(), Validators.required);
    
    this.form = this.formBuilder.group({
      date: this.dateControl,
      cnumber: ['', Validators.required],
      destination: ['', Validators.required],
      type: ['', Validators.required],
      pc: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      rate: [130, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      weight: [0.1, [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      //amount: [100, Validators.required],
      amount: { value: '0', disabled: true },
      couriercode:['', Validators.required]
 
    });
    this.calculateAmount();
    this.form.get('pc')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('rate')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('weight')!.valueChanges.subscribe(() => this.calculateAmount());
    // this.form.get('amount')!.valueChanges.subscribe(() => this.calculateAmount());
  }

  calculateAmount(): void {
    const pc = this.form.get('pc')!.value;
    const rate = this.form.get('rate')!.value;
    const kg = this.form.get('weight')!.value;
    //const gm = this.form.get('amount')!.value;
  
    // Perform the calculation
    const amount = pc * ((kg * 1000) / 1000) * rate;
  
    this.form.get('amount')!.setValue(amount);
  }
  

  onCancelClick() {
    this.dialogRef.close();
  }

  onSaveClick() {
    if (this.form.invalid) {
      // Form has errors, handle accordingly (e.g., show error message)
      return;
    }
    

    const dateValue = this.form.get('date')?.value; 
    // Get the current value of the date field
    const cnumber = this.form.get('cnumber')?.value;
    const destination = this.form.get('destination')?.value;
    const type = this.form.get('type')?.value;
    this.form.get('cnumber')?.setValue(cnumber.toUpperCase());
    this.form.get('destination')?.setValue(destination.toUpperCase());
    this.form.get('type')?.setValue(type.toUpperCase());


    this.form.get('amount')!.enable();
    const updatedRecord = this.form.value;
    let bodyData={
      "cnumber": updatedRecord.cnumber,
      "date": updatedRecord.date,
      "destination":updatedRecord.destination,
      "type":updatedRecord.type,
      "pc":updatedRecord.pc,
      "rate":updatedRecord.rate,
      "weight":updatedRecord.weight,
      "amount":updatedRecord.amount,
      "couriercode":updatedRecord.couriercode
    }
    //console.log(updatedRecord);
   // console.log(bodyData);
    let isError = false;


    const endpoint = `http://localhost:9002/courierdata/create/${this.shippercode}`;

    this.http.post(endpoint,bodyData).subscribe((data:any)=>{
      //console.log(data)
      if(data.status==200){
        this._snackBar.open(data.message,'Dismiss',{
          duration: 4000,
          //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
          // verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        })
        this.form.get('amount')!.disable();
        this.form.reset();
        this.form.get('date')?.setValue(dateValue);
        this.form.get('pc')?.setValue(1)
        this.form.get('rate')?.setValue(130)
        this.form.get('weight')?.setValue(0.1)
        isError = false;
        
        //this.form.get('amount')?.setValue(100)
        const firstInputElement = this.elementRef.nativeElement.querySelector('input');
        if (firstInputElement) {
          this.renderer.selectRootElement(firstInputElement).focus();
        }
      }
    
    },(err:any)=>{
     if(err.status==404){
      this.form.get('amount')!.disable();
      const firstInputElement = this.elementRef.nativeElement.querySelector('input');
      if (firstInputElement) {
        this.renderer.selectRootElement(firstInputElement).focus();
        this.renderer.selectRootElement(firstInputElement).select();
      }
      isError = true;
        this._snackBar.open(err.error.message,'Dismiss',{
          duration: 4000,
          //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
          // verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        })
      }
      else{
      
      
        this._snackBar.open(err.error.message,'Dismiss',{
          duration: 4000,
          //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
          // verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        })
      }
    })
    if (!isError) {
    //console.log('hello')
    }
    
    
    

  }

 
  filterCourierCode(event:any){
    const filterValue = event.target.value.toLowerCase();
    this.availableCourierCode = ['dtdc','trackon','bluedart']
      .filter(type => type.toLowerCase().includes(filterValue));
  }

  filterType(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.availableType = ['NDOX', 'DOX']
      .filter(type => type.toLowerCase().includes(filterValue));
  }
  

  filterDestinations(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const filterValue = value.toLowerCase();
    this.availableDestinations = ['MUM', 'DEl', 'BAN','CHE','SUR','RAJ','JAI','COI','PAT','PUN','HYD','AHM','THI','MAN','VAD','KNP','TRI','IND','COC','KOL','AMR','BHO','MAL','RAI','GUW','LUC','THR','BHU','VAR','CAL','VIZ','SRI','PAL','KOT','KAN','AUR','RAN','DIL','JAM','SHI']
      .filter(destination => destination.toLowerCase().includes(filterValue));
  }

 
}

