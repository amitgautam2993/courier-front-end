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


//constructor
  constructor(public dialog: MatDialog,private route: ActivatedRoute,private router: Router,private formBuilder: FormBuilder,private authService: AuthService,private datePipe: DatePipe) {
    this.searchTerm = '';

  }

//ngOnInit
  ngOnInit() {
    
    // console.log(amountInWords)
    this.cardData = history.state['cardData'];
    console.log(this.cardData)
    this.dateRange = this.formBuilder.group({
      fromDate: '',
      toDate: ''
    });
  
    this.dateRange.valueChanges.subscribe(value => {
      //console.log('Selected date range: ', value.fromDate, ' to ', value.toDate);
      // you can use the selected dates here
      this.dummyData = this.generateDummyData(value.fromDate, value.toDate, 5);
      console.log(this.dummyData[0].date)
      this.filterData();
    });
  
    // Initialize searchTerm to empty string if it is undefined
    this.searchTerm = this.searchTerm || '';
    this.filterData();
   
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

}

// create function


//logout function
logout() {
  this.authService.logout();
  this.router.navigate(['/home'])
}

//searchData function
searchData() {
  this.filteredData = this.dummyData.filter(record => {
    return record.cno.includes(this.searchTerm);
  });
}

//generatePDF
generatePDF() {
  this.getDisplayedIdSum();
  // Define the document definition
  const documentDefinition: TDocumentDefinitions = {
    content: [
      {
        text: 'JAN 2020',
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: 'JC ENTERPRISES',
        style: 'header',
        alignment: 'center',
      },
      {
        text: 'R-20,SRINIWASPURI EXTN. NEW DELHI-110065',
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: 'Email: Sanjaygautam2567@gmail.com',
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
            text: 'M/S PGDAV COLLEGE(EVEN.)\nMAIN ROAD NEHRU NAGAR \nNEW DELHI -110065\nPAGE: 1',
            alignment: 'left',
          },
          {
            text: 'Invoice: 104\nBRANCH CODE: SG\n SHIPPER CODE: PGDAV\nPERIOD: 01/2020',
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
            ['S. No.', 'C/N NO.', 'DATE','DEST', 'TYPE', 'PC','RATE', 'WEIGHT', 'AMOUNT(RS)',],
            ...this.dummyData.map((data,index) => [index + 1, data.cno, this.datePipe.transform(data.date, 'MM/dd/yyyy'),  data.dummy1,data.dummy2,data.dummy3,data.dummy4+'/-',data.dummy5+'gm',data.dummy6+'.00']),
          ],
        },layout: 'lightHorizontalLines'
      },
      {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 2 }]
		    
		},
		{			text:['GROSS TOTAL : ',{text:this.totalamountNumber},'.00'],
		            alignment:'right',
		            margin:[0,3,20,3],
		            bold:true
},
		{canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 2 }]
		    
		},
		{
		    text:['TOTAL NO. OF PACKET : ',{text:this.totalpacket,bold:true}],
		    margin:[0,5,0,0],
		   
		    
		},
			{
			alignment: 'justify',
			style:'columns'
,			columns: [
				{
					text:['Ruppes GROSS TOTAL : ',{text: this.totalamountWords,bold:true}]
					
					
					
				},
				
				{
					text: ['BILLING AMOUNT : ',{text:this.totalamountNumber, bold:true},{text:'.00',bold:true}],
					alignment:'right'
					
				}
			]
		},
    {
      text:['FOR : ',{text:this.cardData.Ownername}],
      alignment:'right',
      margin:[0,10,0,0]
  },
  {
      text:'Authorized Signatory',
      alignment:'right',
      margin:[0,40,0,0]
  },
  {text: 'Term & Condition',bold:true},
  {
    ul: [
      `item 1jjjjjjjjjjjjjjjjjjjjjbbbkhkjhjhjhkj:${this.cardData.Ownername}`,
      'item 2khkhjhjhkjhkjhkjhjkhkjhjkhkjhkjhkjhkj',
      'item 3hkhkjhkjhjkhkjhkjhkjhkjhkjhkjhjkhkjh',
      'item 1uhkjhjkhkjhjkhkjhkjhjkhuhkhjhjkhjhkjhkj',
      'item 2hgbkjhkjhkjhkjhkjhihkhkhuhkjhhkhlihlihhj',
      
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
  console.log(this.filteredData.reduce((acc, curr) => acc + curr.dummy3, 0))
  this.totalpacket= this.filteredData.reduce((acc, curr) => acc + curr.dummy3, 0);
  const numWords = require('num-words')
  upperString = numWords(this.filteredData.reduce((acc, curr) => acc + curr.dummy6, 0));
  this.totalamountWords=upperString.toUpperCase();
  this.totalamountNumber= this.filteredData.reduce((acc, curr) => acc + curr.dummy6, 0);


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
        data.cno.includes(this.searchTerm)
      );
    } else {
      this.filteredData = this.dummyData
    }
  
  }

  //dummy data function

  generateDummyData(fromDate: string, toDate: string, numRecords: number): any[] {
    const data: any[] = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date format');
      return data;
    }
  
    for (let i = 0; i < numRecords; i++) {
      const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      const record = {
        id: i + 1,
        date: date,
        cno: Math.floor(Math.random() * 1000000000) + 1+`${i + 1}`,
        dummy1: (Math.random() + 1).toString(36).substring(9),
        dummy2: (Math.random() + 1).toString(36).substring(9),
        dummy3: Math.floor(Math.random() * 100) + 1,
        dummy4: Math.floor(Math.random() * 1000) + 1,
        dummy5: Math.floor(Math.random() * 1000) + 1,
        dummy6: Math.floor(Math.random() * 10000) + 1,
        
      };
      data.push(record);
    }
  
    // Sort the data by date
    data.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
  
    return data;
  }

  

  
  openModal(record:any){
    
    
    console.log(record)
    this.dialog.open(editModalComapnyDetailComponent,{
      autoFocus:true,
      height:'400px',
      width:'500px',
      panelClass:[],
      disableClose:true,
      data: record // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res=>{
      console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
  }
  
  createModal(){

    this.dialog.open(createModalComapnyDetailComponent,{
      
      height:'400px',
      width:'500px',
      panelClass:[],
      
      // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res=>{
      console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
  }
  
  trackModal(record:any){
    this.dialog.open(trackingModalComapnyDetailComponent,{
      disableClose:true,
      height:'700px',
      width:'500px',
      panelClass:[],
      data: record
      // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res=>{
      console.log(`Dialog result: ${res}`);
      // this.getCards();
    },);
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
  cno:String='';
  destinationExpanded: boolean = false;
  originExpanded: boolean = false;
  trackExpanded:boolean=true
  constructor(private http: HttpClient,public dialogRef: MatDialogRef<trackingModalComapnyDetailComponent>,@Inject(MAT_DIALOG_DATA) public data: any){
this.cno=data.cno
    
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
      "tracking_number": this.cno,
      "carrier_code": "trackon"
      // "tracking_number": "d38418282",
      // "carrier_code": "dtdc"
    };

    this.http.post("http://localhost:9002/api/trackings/realtime", bodyData)
      .subscribe(
        (response) => {
          // Handle the response here
          this.trackingData=response
          this.isLoading = false;
          console.log(this.trackingData);

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
      cno: [this.data.cno],
      dummy1: [this.data.dummy1],
      dummy2: [this.data.dummy2],
      dummy3: [this.data.dummy3],
      dummy4: [this.data.dummy4],
      dummy5: [this.data.dummy5],
      dummy6: [this.data.dummy6],
    });
  }

  
  ngOnInit(): void {
    this.formattedDate = this.datePipe.transform(this.data.date, 'dd/MM/yyyy') || '';

    this.form.patchValue({
      id: this.data.id || '',
      date: this.data.date||'',
      cno: this.data.cno || '',
      dummy1: this.data.dummy1 || '',
      dummy2: this.data.dummy2 || '',
      dummy3: this.data.dummy3 || '',
      dummy4: this.data.dummy4 || '',
      dummy5: this.data.dummy5 || '',
      dummy6: this.data.dummy6 || '',
    });
  }
  

  onCancelClick(){

    this.dialogRef.close();
  }
  onSaveClick() {
    const updatedRecord = this.form.value;
    console.log(updatedRecord);
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
//       cno: ['', Validators.required],
//       dummy1: this.destinationControl,
//       dummy2: ['', Validators.required],
//       dummy3: ['', Validators.required],
//       dummy4: ['', Validators.required],
//       dummy5: ['', Validators.required],
//       dummy6: ['', Validators.required],
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
export class createModalComapnyDetailComponent implements OnInit {
  dateControl!: FormControl;
  availableType: string[] = ['DOX','NON-DOX']
  availableDestinations: string[] = ['MUM', 'DEl', 'BAN','CHE','SUR','RAJ','JAI','COI','PAT','PUN','HYD','AHM','THI','MAN','VAD','KNP','TRI','IND','COC','KOL','AMR','BHO','MAL','RAI','GUW','LUC','THR','BHU','VAR','CAL','VIZ','SRI','PAL','KOT','KAN','AUR','RAN','DIL','JAM','SHI'];
  @ViewChild('input1') input1!: ElementRef;
  @ViewChild('input2') input2!: ElementRef;
  @ViewChild('input3') input3!: ElementRef;
  @ViewChild('input4') input4!: ElementRef;
  @ViewChild('input5') input5!: ElementRef;
  @ViewChild('input6') input6!: ElementRef;
  @ViewChild('input7') input7!: ElementRef;
  //@ViewChild('input8') input8!: ElementRef;
  @ViewChild('input9') input9!: ElementRef;
  ngOnInit(): void {

    this.addEventListeners();

  }
  

  addEventListeners(): void {
    this.input1.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.input1.nativeElement.value) {
          this.input2.nativeElement.focus();
        }
      }
    });

    this.input2.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!this.form.controls['date'].invalid) {
          this.input3.nativeElement.focus();
        }
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
        } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
    this.input5.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        if (this.input5.nativeElement.value) {
        this.input6.nativeElement.focus();
      } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
    this.input6.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        if (this.input6.nativeElement.value) {
        this.input7.nativeElement.focus();
      } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
    this.input7.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        if (this.input7.nativeElement.value) {
        this.input9.nativeElement.focus();
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
    this.input9.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        this.onSaveClick();
        
        this.input1.nativeElement.focus();
       // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });
  }
  form: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    public dialogRef: MatDialogRef<createModalComapnyDetailComponent>,
    private elementRef: ElementRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.dateControl = new FormControl(new Date(), Validators.required);
    
    this.form = this.formBuilder.group({
      date: this.dateControl,
      cno: ['', Validators.required],
      dummy1: ['', Validators.required],
      dummy2: ['', Validators.required],
      dummy3: [1, Validators.required],
      dummy4: [130, Validators.required],
      dummy5: [0, Validators.required],
      //dummy6: [100, Validators.required],
      dummy7: { value: '0', disabled: true }
 
    });
    this.calculateAmount();
    this.form.get('dummy3')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('dummy4')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('dummy5')!.valueChanges.subscribe(() => this.calculateAmount());
    // this.form.get('dummy6')!.valueChanges.subscribe(() => this.calculateAmount());
  }

  calculateAmount(): void {
    const pc = this.form.get('dummy3')!.value;
    const rate = this.form.get('dummy4')!.value;
    const kg = this.form.get('dummy5')!.value;
    //const gm = this.form.get('dummy6')!.value;
  
    // Perform the calculation
    const amount = pc * ((kg * 1000) / 1000) * rate;
  
    this.form.get('dummy7')!.setValue(amount);
  }
  

  onCancelClick() {
    this.dialogRef.close();
  }

  onSaveClick() {
    if (this.form.invalid) {
      // Form has errors, handle accordingly (e.g., show error message)
      return;
    }
    const dateValue = this.form.get('date')?.value; // Get the current value of the date field
    const updatedRecord = this.form.value;
    console.log(updatedRecord);
    
    this.form.reset();
    this.form.get('date')?.setValue(dateValue);
    this.form.get('dummy3')?.setValue(1)
    this.form.get('dummy4')?.setValue(130)
    this.form.get('dummy5')?.setValue(0)
    //this.form.get('dummy6')?.setValue(100)
    const firstInputElement = this.elementRef.nativeElement.querySelector('input');
    if (firstInputElement) {
      this.renderer.selectRootElement(firstInputElement).focus();
    }

  }

  // filterType(event: Event){
  //   const value = (event.target as HTMLInputElement).value;
  //   const filterValue = value.toLowerCase();
  //   this.availableType=['DOX','NON-DOX']
  //   .filter(type => type.toLowerCase().includes(filterValue));
  // }
  filterType(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.availableType = ['DOX', 'NON-DOX']
      .filter(type => type.toLowerCase().includes(filterValue));
  }
  

  filterDestinations(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const filterValue = value.toLowerCase();
    this.availableDestinations = ['MUM', 'DEl', 'BAN','CHE','SUR','RAJ','JAI','COI','PAT','PUN','HYD','AHM','THI','MAN','VAD','KNP','TRI','IND','COC','KOL','AMR','BHO','MAL','RAI','GUW','LUC','THR','BHU','VAR','CAL','VIZ','SRI','PAL','KOT','KAN','AUR','RAN','DIL','JAM','SHI']
      .filter(destination => destination.toLowerCase().includes(filterValue));
  }

  // filterDestinations(event: Event) {
  //   const value = (event.target as HTMLInputElement).value;
  //   const filterValue = value.toLowerCase();
  //   const filteredDestinations = ['MUM', 'DEl', 'BAN', 'CHE', 'SUR', 'RAJ', 'JAI', 'COI', 'PAT', 'PUN', 'HYD', 'AHM', 'THI', 'MAN', 'VAD', 'KNP', 'TRI', 'IND', 'COC', 'KOL', 'AMR', 'BHO', 'MAL', 'RAI', 'GUW', 'LUC', 'THR', 'BHU', 'VAR', 'CAL', 'VIZ', 'SRI', 'PAL', 'KOT', 'KAN', 'AUR', 'RAN', 'DIL', 'JAM', 'SHI']
  //     .filter(destination => destination.toLowerCase().includes(filterValue));
    
  //   this.availableDestinations = filteredDestinations.slice(0, 3);
  // }
  
}

