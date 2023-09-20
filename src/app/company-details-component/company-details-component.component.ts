import { Component, OnInit, Inject, ElementRef, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { TDocumentDefinitions } from "pdfmake/interfaces";
//import {FocusDirective} from '../directives/autofocus/autofocus.directive'
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import {  getUserDetails } from '../localStorageService';
import * as moment from 'moment';
import 'moment-timezone';
import { CustomSnackbarService } from '../custom-snackbar.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
  shippercode: string = ''
  header: string = ''
  monthYear: string = ''
  year: any
  month: any
  monthNumber: any
  date: any
  fromDate: any
  newInvoiceNumber: any;
  toDate: any;
  invoiceMonthYear: string = ''

  constructor(private customSnackbarService: CustomSnackbarService, private _snackBar: MatSnackBar, private http: HttpClient, public dialog: MatDialog, private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private authService: AuthService, private datePipe: DatePipe) {
    this.searchTerm = '';

  }




  //ngOnInitpd
  ngOnInit() {

    this.header = `${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}`

    this.cardData = history.state['cardData'];
    this.shippercode = history.state['cardData'].shippercode;


 
    this.dateRange = this.formBuilder.group({
      fromDate: '',
      toDate: ''
    });

 
    this.dateRange.valueChanges.subscribe(value => {
  

      const fromDateT = moment(value.fromDate).tz('your-time-zone').startOf('day');
      const toDateT = moment(value.toDate).tz('your-time-zone').endOf('day');
      this.fromDate = fromDateT.toISOString();
      this.date = fromDateT.format('DD');
      this.year = fromDateT.format('YYYY'); // Get the year from the Date object
      this.month = fromDateT.format('MMM'); // Get the month as a character
      this.monthNumber = fromDateT.format('MM');// get the month as a number
      this.monthYear = `${this.month} ${this.year}`
      this.toDate = toDateT.toISOString();
      this.fetchCourierData()



      // Construct the API endpoint with query parameters

      // Make the API call using the Angular Router


    });



    // Initialize searchTerm to empty string if it is undefined
    this.searchTerm = this.searchTerm || '';
    this.filterData();
  }
  //Rough code

  // daterangeMonth() {
  //   if (this.selectedMonth) {
  //     const [year, month] = this.selectedMonth.split('-').map(Number);
  //     this.fromDate = this.getStartDateISO(year, month);
  //     this.toDate = this.getEndDateISO(year, month);
  //     this.fetchCourierData();
  //     //console.log("Start Date:", startDate);
  //     //console.log("End Date:", endDate);
  //   }

  // }
  // getStartDateISO(year: number, month: number): string {
  //   const firstDay = new Date(Date.UTC(year, month - 1, 1, 18, 30, 0, 0));
  //   return firstDay.toISOString();
  // }


  // getEndDateISO(year: number, month: number): string {
  //   const firstDayNextMonth = new Date(Date.UTC(year, month, 1, 18, 30, 0, 0));
  //   const lastDay = new Date(firstDayNextMonth.getTime() - 1);
  //   return lastDay.toISOString();
  // }


  // Example usage:

  // Output will be "2023-09-01T18:30:00.000Z&to=2023-09-30T18:29:59.999Z"


  //Rough code

  formatDateToMonYYYY(dateString: string | number | Date) {
    const date = new Date(dateString);
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
  fetchCourierData() {
    if (this.toDate!=undefined) {

      const endpoint = `/courierdata/daterange/${this.shippercode}?from=${this.fromDate}&to=${this.toDate}`;
      this.http.get<any>(endpoint).subscribe(data => {
        // console.log(data.data.courierDetails) 

        this.dataFound = true;
        this.dummyData = data.data.courierDetails
        this.filterData();
        this.invoiceMonthYear = this.formatDateToMonYYYY(this.dummyData[0].date)
      }, (error: any) => {
        if (error.status == 404) {
          this.dummyData = []
          this.dataFound = false;
          this.filterData();
          this.customSnackbarService.openSnackBar(error.error.message, 'error');
        }
        else {
          // Handle other error scenarios (status 500, 404, etc.)
          this.dataFound = false;
          this.customSnackbarService.openSnackBar(error.error.message, 'error');
        }
        //console.log('Error Fetching data:')
      }
      );
    }
    else {
      this.dataFound = true;
      this.dummyData = []
      this.filterData();
    }

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

    this.fetchCourierData();

  }

  // create function


  //logout function
 
  //searchData function
  searchData() {
    this.filteredData = this.dummyData.filter(record => {
      return record.cnumber.includes(this.searchTerm.toUpperCase());
    });
  }

  //generatePDF
  generatePDF() {
    this.getDisplayedIdSum();
    // Define the document definition
    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          text: `${this.invoiceMonthYear}`,
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
              text: [`INVOICE: ${this.year + this.monthNumber + this.date + this.cardData.shippercode}\nBRANCH CODE: ${getUserDetails().branchcode}\n SHIPPER CODE: ${this.cardData.shippercode}\nPERIOD: `, { text: `${this.year}` }],
              alignment: 'right',
            },
          ],
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }],
        },
        {
          style: 'tableExample',
          alignment: 'center',

          table: {
            headerRows: 1,
            body: [
              ['S/N', 'C/N NO.', 'DATE', 'DEST', 'TYPE', 'PC', 'EWAY', 'WT.', 'AMT',],
              ...this.dummyData.map((data, index) => [index + 1, data.cnumber, this.datePipe.transform(data.date, 'dd/MM/yyyy'), data.destination, data.type, data.pc, data.ewaybill + '.00', data.weight + 'Kg', data.amount + '.00']),
            ],
            widths: ['6%', '17%', '17%', '8%', '9%', '4.5%', '18%', '9%', '15%'],
          }, layout: 'lightHorizontalLines'
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 2 }]

        },
        {
          fontSize: 10, text: ['GROSS TOTAL : ', { text: this.totalamountNumber }, '.00'],
          alignment: 'right',
          margin: [0, 3, 2, 3],
          bold: true
        },
        {
          fontSize: 10, text: ['F.O.V. CHARGES 0.3% : ', { text: this.fovcharges }, '.00'],
          alignment: 'right',
          margin: [0, 3, 2, 3],
          bold: true
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 2 }]

        },
        {
          fontSize: 10,
          text: ['TOTAL NO. OF PACKET : ', { text: this.totalpacket, bold: true, fontSize: 10 }],
          margin: [0, 5, 0, 0],


        },
        {
          fontSize: 10,
          alignment: 'justify'

          , columns: [
            {
              text: ['Ruppes GROSS TOTAL : ', { text: this.totalbillWords + ' ONLY', bold: true, fontSize: 10 }]
            },

            {
              text: ['BILLING AMOUNT : ', { text: this.totalbill, bold: true }, { text: '.00', bold: true }],
              alignment: 'right'

            }
          ]
        },
        {
          // text:['FOR : ',{text:this.cardData.firstname +' '+ this.cardData.lastname }],
          text: ['FOR : ', { text: getUserDetails().firstname.toUpperCase() + ' ' + getUserDetails().lastname.toUpperCase(), bold: true }],
          alignment: 'right',
          margin: [0, 10, 0, 0],

        },
        {
          text: 'Authorized Signatory',
          alignment: 'right',
          margin: [0, 40, 0, 0]
        },
        { text: 'Term & Condition', bold: true },
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
    //pdfMake.createPdf(documentDefinition).print();
    pdfMake.createPdf(documentDefinition).download(`${this.cardData.company} ` + `${this.invoiceMonthYear}`);
  }

  totalpacket: any
  totalamountWords: any
  totalamountNumber: any
  fovcharges: any
  totalbill: any
  totalbillWords: any
  // totalpacketInt:number=0
  // totalamountWordsInt:number=0
  // totalamountNumberInt:number=0
  //getDisplayedIdSum function
  getDisplayedIdSum() {
    let upperString = ''
    //console.log(this.filteredData.reduce((acc, curr) => acc + curr.pc, 0))
    this.totalpacket = this.filteredData.reduce((acc, curr) => acc + curr.pc, 0);
    const numWords = require('num-words')
    upperString = numWords(this.filteredData.reduce((acc, curr) => acc + curr.amount, 0));
    this.totalamountWords = upperString.toUpperCase();
    this.totalamountNumber = this.filteredData.reduce((acc, curr) => acc + curr.amount, 0);
    const sum = this.filteredData.reduce((acc, curr) => acc + Number(curr.ewaybill || 0), 0); // 0 is the default value
    this.fovcharges = Math.round(sum * 0.003);
    this.totalbill = this.totalamountNumber + this.fovcharges
    this.totalbillWords = numWords(this.totalbill).toUpperCase();
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







  editModal(record: any) {


    this.dialog.open(editModalComapnyDetailComponent, {
      autoFocus: true,
      height: '400px',
      width: '600px',
      panelClass: [],
      disableClose: true,
      data: { header: 'Edit Courier Details', data: record, shipperCode: this.cardData.shippercode } // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res => {
      this.refresh();
    },);
  }

  createModal() {

    this.dialog.open(createModalComapnyDetailComponent, {

      height: '400px',
      width: '600px',
      panelClass: [],
      data: this.shippercode
      // pass record object instead of { data: this.data }
    }).afterClosed().subscribe(res => {
      this.refresh()
    },);
  }

  trackModal(record: any) {
    this.dialog.open(trackingModalComapnyDetailComponent, {
      disableClose: true,
      height: '700px',
      width: '500px',
      panelClass: [],
      data: record,
    }).afterClosed().subscribe(res => {
      this.refresh();
  
    },);
  }

  deleteModal(record: any) {
    this.dialog.open(deleteModalComapnyDetailComponent, {
      autoFocus: true,
      maxHeight: '315px',
      width: '380px',
      panelClass: [],
      disableClose: true,
      data: record
    }).afterClosed().subscribe(res => {
      this.refresh()
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
export class deleteModalComapnyDetailComponent {
  deleteId: string = ''
  cnumber: string = ''
  constructor(
    private customSnackbarService: CustomSnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<deleteModalComapnyDetailComponent>
  ) {
    this.cnumber = data.cnumber
    this.deleteId = data._id
  }

  deleteById() {
    //console.log(this.deleteId)
    const endpoint = `/courierdata/delete/${this.deleteId}`;

    this.http.delete(endpoint).subscribe((response: any) => {
      this.dialogRef.close(true);
      this.customSnackbarService.openSnackBar(response.message, 'success');


    }, (error) => {
      this.customSnackbarService.openSnackBar(error.message, 'error');
  
    })
  }

}

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './tracking-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})




export class trackingModalComapnyDetailComponent implements OnInit {
  trackingData: any;
  isLoading!: boolean;
  cnumber: string = '';
  destinationExpanded: boolean = false;
  originExpanded: boolean = false;
  trackExpanded: boolean = true
  showCustomSpinner = true;
  couriercode: string = '';
  constructor(private http: HttpClient, public dialogRef: MatDialogRef<trackingModalComapnyDetailComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.cnumber = data.cnumber
    this.couriercode = data.couriercode
  }

  toggleDestination() {
    this.destinationExpanded = !this.destinationExpanded;
  }

  toggleOrigin() {
    this.originExpanded = !this.originExpanded;
  }
  toggleTrack() {
    this.trackExpanded = !this.trackExpanded;
  }
  ngOnInit() {
    this.isLoading = true;
    let bodyData = {
      "tracking_number": this.cnumber,
      "carrier_code": this.couriercode
      // "tracking_number": "d38418282",
      // "carrier_code": "dtdc"
    };
    //console.log(bodyData)
    this.http.post("/api/trackings/realtime", bodyData)
      .subscribe(
        (response) => {
          // Handle the response here
          this.trackingData = response
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          // Handle errors here
          console.error(error);
        }
      );
  }

  onCancelClick() {
    this.dialogRef.close();

  }

}





//MODAL

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './edit-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})
export class editModalComapnyDetailComponent implements OnInit {
  form: FormGroup;
  formattedDate: string = '';
  updateId: string = ''
  initialData: any;
  header: any;
  shipperCode: any;
  constructor(public dialog: MatDialog, private customSnackbarService: CustomSnackbarService,
    public dialogRef: MatDialogRef<editModalComapnyDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder, private datePipe: DatePipe,
    private http: HttpClient,
  ) {
    this.header = data.header
    this.shipperCode = data.shipperCode
    this.updateId = data.data._id
    this.form = this.fb.group({

      date: [this.data.data.date],
      cnumber: [this.data.data.cnumber],
      destination: [this.data.data.destination],
      type: [this.data.data.type],
      pc: [this.data.data.pc],
      rate: [this.data.data.rate],
      weight: [this.data.data.weight],
      amount: [this.data.data.amount],
      couriercode: [this.data.data.couriercode],
      ewaybill: [this.data.data.ewaybill]
    });
  }


  ngOnInit(): void {
    this.formattedDate = this.datePipe.transform(this.data.date, 'dd/MM/yyyy') ?? '';
    this.initialData = this.form.value;
    this.form.patchValue({
      id: this.data.data.id || '',
      date: this.data.data.date || '',
      cnumber: this.data.data.cnumber || '',
      destination: this.data.data.destination || '',
      type: this.data.data.type || '',
      pc: this.data.data.pc || '',
      rate: this.data.data.rate,
      weight: this.data.data.weight,
      amount: this.data.data.amount,
      couriercode: this.data.data.couriercode || '',
      ewaybill: this.data.data.ewaybill ?? '',
    });
  }


  onCancelClick() {

    this.dialogRef.close();
  }

  onDeleteClick() {
    this.dialog.open(deleteModalComapnyDetailComponent, {
      autoFocus: true,
      maxHeight: '315px',
      width: '380px',
      panelClass: [],
      disableClose: true,
      data: this.data.data
    }).afterClosed().subscribe(res => {
      if (res) {
        this.dialogRef.close();
      }

    },);
  }

  onSaveClick() {
    if (this.form.invalid) {
      // Form has errors, handle accordingly (e.g., show error message)
      return;
    }


    const updatedRecord = this.form.value;
    if (JSON.stringify(this.initialData) === JSON.stringify(updatedRecord)) {
      // Data has not changed, handle accordingly (e.g., show a message)
      return this.customSnackbarService.openSnackBar('Please Update Something', 'info');
    }
    let bodyData = {
      "cnumber": updatedRecord.cnumber.toUpperCase(),
      "date": updatedRecord.date,
      "destination": updatedRecord.destination.toUpperCase(),
      "type": updatedRecord.type.toUpperCase(),
      "pc": updatedRecord.pc,
      "rate": updatedRecord.rate,
      "weight": updatedRecord.weight,
      "amount": updatedRecord.amount,
      "couriercode": updatedRecord.couriercode,
      "ewaybill": updatedRecord.ewaybill
    }
    const endpoint = `/courierdata/update/${this.updateId}`;

    this.http.put(endpoint, bodyData).subscribe((data: any) => {
      //console.log(data)
      if (data.status == 200) {
        this.dialogRef.close(updatedRecord);
        this.customSnackbarService.openSnackBar(data.message, 'success');

        // this._snackBar.open(data.message,'Dismiss',{
        //   duration: 4000,
        //   //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
        //   // verticalPosition: 'top',
        //   panelClass: ['custom-snackbar']
        // })


        //this.form.get('amount')?.setValue(100)

      }

    }, (err: any) => {
      if (err.status == 404) {
        this.customSnackbarService.openSnackBar(err.error.message, 'error');

        // this._snackBar.open(err.error.message,'Dismiss',{
        //   duration: 4000,
        //   //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
        //   // verticalPosition: 'top',
        //   panelClass: ['custom-snackbar']
        // })
      }
      else {
        this.customSnackbarService.openSnackBar(err.error.messag, 'error');


        // this._snackBar.open(err.error.message,'Dismiss',{
        //   duration: 4000,
        //   //     horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
        //   // verticalPosition: 'top',
        //   panelClass: ['custom-snackbar']
        // })
      }
    })

    // //console.log(updatedRecord);
  }
}

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './create-modal-company-details-component.component.html',
  styleUrls: ['./company-details-component.component.scss']
})


export class createModalComapnyDetailComponent implements AfterViewInit {
  shippercode: string = ''
  dateControl!: FormControl;
  availableType: string[] = ['NDOX', 'DOX'];
  availableCourierCode: string[] = ['dtdc', 'trackon', 'bluedart', 'delhivery'];
  availableDestinations: any[] = [];
  setDestination: string = ''
  toolTipCity: any = ''
  @ViewChild('input1') input1!: ElementRef<HTMLInputElement>;
  @ViewChild('input2') input2!: ElementRef<HTMLInputElement>;
  @ViewChild('input3') input3!: ElementRef<HTMLInputElement>;
  @ViewChild('input4') input4!: ElementRef<HTMLInputElement>;
  @ViewChild('input5') input5!: ElementRef<HTMLInputElement>;
  @ViewChild('input6') input6!: ElementRef<HTMLInputElement>;
  @ViewChild('input7') input7!: ElementRef<HTMLInputElement>;
  @ViewChild('input8') input8!: ElementRef<HTMLInputElement>;
  @ViewChild('input10') input10!: ElementRef<HTMLInputElement>;
  @ViewChild('input11') input11!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {

    this.addEventListeners();

  }

  addCodes() {
    this.dialog.open(codeModalComapnyDetailComponent, {
      autoFocus: true,
      height: '200px',
      width: '380px',
      panelClass: [],

    }).afterClosed().subscribe(res => {

      console.log(`Dialog result: ${res}`);
      this.form.get('destination')?.setValue(res);
      this.availableDestinations = []
      this.input4.nativeElement.focus();



    },);

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
      this.availableDestinations = []
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
          this.input4.nativeElement.select();
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
          this.input8.nativeElement.select();
        } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });

    this.input8.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {

        event.preventDefault();
        if (this.input8.nativeElement.value) {
          this.input11.nativeElement.focus();
          this.input11.nativeElement.select();

        } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }
    });

    this.input11.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const inputValue = this.input11.nativeElement.value;
        const pattern = /^\d+$/; // Regular expression to match only numbers

        if (this.input8.nativeElement.value && pattern.test(inputValue)) {
          this.input10.nativeElement.focus();
        }
        else {
          // Handle error: display an error message, or set focus to another input, etc.
          this.customSnackbarService.openSnackBar('Invalid input or missing value in Ewaybill', 'info');
        } // Optionally, you can blur the last input field
        // Perform any additional actions here
      }

    });
  }
  
 
  setSelectedOption(event: MatAutocompleteSelectedEvent) {
    console.log(event.option.value.name);
    if(event.option.value.code==='GGN' || event.option.value.code==='SPT'||event.option.value.state==='Delhi' || event.option.value.code==='NDA' || event.option.value.code==='FDA'){


      this.form.get('destination')?.setValue(`${event.option.value.code}`);
      this.form.get('rate')?.setValue(90);
    }
    else{
     
      this.form.get('destination')?.setValue(`${event.option.value.code}`);
      this.form.get('rate')?.setValue(130);


    }
    this.setDestination = event.option.value.code
    this.toolTipCity = event.option.value.name

  }
  form: FormGroup;
  constructor(
    public dialog: MatDialog,
    private customSnackbarService: CustomSnackbarService,
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


    this.shippercode = data
    this.dateControl = new FormControl(new Date(), Validators.required);

    this.form = this.formBuilder.group({
      date: this.dateControl,
      cnumber: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^[a-zA-Z0-9]*$/)]],
      destination: ['', Validators.required],
      type: ['', Validators.required],
      pc: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      rate: [130, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      weight: [0.1, [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      amount: { value: '0', disabled: true },
      couriercode: ['', Validators.required],
      ewaybill: [0.00, [Validators.required, Validators.pattern(/^[0-9]*$/)]]

    });
    this.calculateAmount();
    this.form.get('pc')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('rate')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('weight')!.valueChanges.subscribe(() => this.calculateAmount());
    this.form.get('cnumber')?.valueChanges.subscribe(() => this.cnumberChange());
    this.form.get('couriercode')?.valueChanges.subscribe(() => this.courierCodeChange());

    this.form.get('destination')!.valueChanges
      .pipe(
        debounceTime(400),
        switchMap(query => this.http.get<any[]>(`/codes/search?query=${query}`))
      )
      .subscribe(results => {
        if (results.length > 0) {
          this.availableDestinations = results.slice(0, 10);
        }
        else {
          this.availableDestinations = [];


        }
      
      });



  }
  courierCodeChange(){
    const cnumberValue = this.form.get('cnumber')?.value;
    const couriercodeValue = this.form.get('couriercode')?.value;
    if(couriercodeValue==='bluedart'){
      this.form.get('rate')?.setValue(800);
      this.form.get('type')?.setValue('NDOX');
    }
    
    else{
      if(cnumberValue[0].toLowerCase() === 'x'){
      this.form.get('rate')?.setValue(400);
      this.form.get('type')?.setValue('NDOX');
    }
      else{
        this.form.get('rate')?.setValue(130);
        this.form.get('type')?.setValue('NDOX');
      }
    }
   

  }

  async generateUniqueAbbreviation(cityName: string, http: HttpClient): Promise<string> {
    // Generate an initial abbreviation (first 3 characters of the city name)
    let abbreviation = cityName.substring(0, 3).toUpperCase();

    while (true) {
      // Check if the abbreviation exists in the backend
      const exists = await this.checkAbbreviationExists(abbreviation, http);

      if (!exists) {
        // If the abbreviation doesn't exist, it's unique
        return abbreviation;
      }

      // If it exists, modify the abbreviation and check again
      abbreviation = this.modifyAbbreviation(abbreviation);
    }
  }

  async checkAbbreviationExists(abbreviation: string, http: HttpClient): Promise<boolean> {
    try {
      const response = await this.http.get<any>(`/codes/abbreviation?query=${abbreviation}`).toPromise();
      return response.codeexists === true;
    } catch (error) {
      console.error(error);
      return false; // Assume it doesn't exist on error
    }
  }

  modifyAbbreviation(abbreviation: string): string {
    // Logic to modify the abbreviation, for example, by adding a digit
    // You can implement your own logic here based on your requirements
    return abbreviation + '';
  }

  cnumberChange() {
    console.log("rateChange called");
    const cnumberValue = this.form.get('cnumber')?.value;

    // Check for null or undefined
    if (cnumberValue) {

      // Case-insensitive check for 'x'
      // if (cnumberValue.toLowerCase().includes('x')) {
      if (cnumberValue[0].toLowerCase() === 'x') {

        console.log('rate:400');
        this.form.get('rate')?.setValue(400);
        this.form.get('couriercode')?.setValue('dtdc');
        this.form.get('type')?.setValue('NDOX');
        this.availableCourierCode = ['dtdc','bluedart','delhivery','trackon'];

      }
      // Check for numbers, if needed
      else if (!isNaN(Number(cnumberValue))) {
        this.form.get('rate')?.setValue(800);
        this.form.get('couriercode')?.setValue('bluedart');
        this.form.get('type')?.setValue('NDOX');
        this.availableCourierCode = ['bluedart','delhivery','dtdc', 'trackon'];

        // Do something for numbers
      }
      else if (cnumberValue[0].toLowerCase() === 'd' || cnumberValue[0].toLowerCase() === 'z') {
        this.form.get('rate')?.setValue(130);
        this.form.get('couriercode')?.setValue('dtdc');
        this.form.get('type')?.setValue('NDOX');
        this.availableCourierCode = ['dtdc','bluedart','delhivery','trackon'];

      }
      else {
        this.form.get('rate')?.setValue(130);
        this.form.get('couriercode')?.setValue('');  // Reset the field to its initial state
        this.form.get('type')?.setValue('');
        this.availableCourierCode = ['dtdc', 'trackon', 'bluedart'];



      }
      console.log("New couriercode:", this.form.get('couriercode')?.value);

    }
  }
  calculateAmount(): void {
    const pc = this.form.get('pc')!.value;
    const rate = this.form.get('rate')!.value;
    //const kg = this.form.get('weight')!.value;
    const kg = this.convertWeight(this.form.get('weight')!.value);
    //const gm = this.form.get('amount')!.value;

    // Perform the calculation


    const amount = pc * ((kg * 1000) / 1000) * rate;

    this.form.get('amount')!.setValue(amount);
  }

  convertWeight(inputWeight: number): number {
    return Math.ceil(inputWeight);
  }

  // onCancelClick() {
  //   this.dialogRef.close();
  // }

  private incrementCN(cn: string): string {
    let prefix = '';
    let number = '';

    for (const char of cn) {
      if (isNaN(Number(char))) {
        prefix += char;
      } else {
        number += char;
      }
    }

    // Check if a number was actually found
    if (number === '') {
      return cn;  // Return the original C/N string if no number part was found
    }

    const newNumber = parseInt(number) + 1;
    return `${prefix}${newNumber}`;
  }


  onSaveClick() {
    if (this.form.invalid) {
      // Form has errors, handle accordingly (e.g., show error message)
      return;
    }

    const destinationControl = this.form.get('destination')!;
const destinationValue = destinationControl.value;
if (!destinationValue) {
  // If destination is blank, set it to a default value
  destinationControl.setValue('DefaultDestination');
}
    const dateValue = this.form.get('date')?.value;
    // Get the current value of the date field
    const cnumber = this.form.get('cnumber')?.value;
    const destination = this.form.get('destination')!.value;
    const type = this.form.get('type')?.value;
    const couriercode = this.form.get('couriercode')?.value;
    this.form.get('cnumber')?.setValue(cnumber.toUpperCase());
    this.form.get('destination')?.setValue(destination.toUpperCase());
    this.form.get('type')?.setValue(type.toUpperCase());
    this.form.get('couriercode')?.setValue(couriercode.toLowerCase());


    this.form.get('amount')!.enable();
    const updatedRecord = this.form.value;
    console.log(updatedRecord)
    let bodyData = {
      "cnumber": updatedRecord.cnumber,
      "date": updatedRecord.date,
      // "destination": this.setDestination,
      "destination": destinationControl.value, // Use the form control's value
      "type": updatedRecord.type,
      "pc": updatedRecord.pc,
      "rate": updatedRecord.rate,
      "weight": updatedRecord.weight,
      "amount": updatedRecord.amount,
      "couriercode": updatedRecord.couriercode,
      "ewaybill": updatedRecord.ewaybill
    }
    let isError = false;


    const endpoint = `/courierdata/create/${this.shippercode}`;

    this.http.post(endpoint, bodyData).subscribe((data: any) => {
      //console.log(data)
      if (data.status == 200) {
        this.customSnackbarService.openSnackBar(data.message, 'success');
        const currentCN = this.form.get('cnumber')?.value;
        const newCN = this.incrementCN(currentCN);
        this.form.get('amount')!.disable();
        this.form.reset();
        this.form.get('cnumber')?.setValue(newCN);
        this.form.get('date')?.setValue(dateValue);
        this.form.get('pc')?.setValue(1)
        this.form.get('rate')?.setValue(130)
        this.form.get('weight')?.setValue(0.1)
        this.form.get('ewaybill')?.setValue(0.00)
        isError = false;

        //this.form.get('amount')?.setValue(100)
        const firstInputElement = this.elementRef.nativeElement.querySelector('input');
        if (firstInputElement) {
          this.renderer.selectRootElement(firstInputElement).focus();
          this.renderer.selectRootElement(firstInputElement).select();

        }
      }

    }, (err: any) => {
      if (err.status == 404) {
        this.form.get('amount')!.disable();
        const firstInputElement = this.elementRef.nativeElement.querySelector('input');
        if (firstInputElement) {
          this.renderer.selectRootElement(firstInputElement).focus();
          this.renderer.selectRootElement(firstInputElement).select();
        }
        isError = true;
        this.customSnackbarService.openSnackBar(err.error.message, 'error', 'Edit Record',
          () => this.editModal(err.error.data));
       
      }
      else {
        this.customSnackbarService.openSnackBar(err.error.message, 'error');

      }
    })
    if (!isError) {
      //console.log('hello')
    }




  }
  editModal(data: any) {
    console.log(data);
    // Your modal opening logic here
    this.dialog.open(editModalComapnyDetailComponent, {
      autoFocus: true,
      height: '400px',
      width: '600px',
      panelClass: [],
      disableClose: true,
      data: { header: 'Edit Record For Duplicate CNumber', data: data.courierDetails, shipperCode: data.id }, // pass record object instead of { data: this.data }
      position: { top: '50px', left: '50px' }
    }).afterClosed().subscribe(res => {

    },);
  }

  filterCourierCode(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.availableCourierCode = ['dtdc', 'trackon', 'bluedart','delhivery']
      .filter(type => type.toLowerCase().includes(filterValue));
  }

  filterType(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.availableType = ['NDOX', 'DOX']
      .filter(type => type.toLowerCase().includes(filterValue));
  }


  // filterDestinations(event: Event) {
  //   const value = (event.target as HTMLInputElement).value;
  //   const filterValue = value.toLowerCase();
  //   this.availableDestinations
  //     .filter(destination => destination.toLowerCase().includes(filterValue));
  // }



}

@Component({
  selector: 'modal-app-company-details-component',
  templateUrl: './codes-modal-company.component.html',
  styleUrls: ['./company-details-component.component.scss']
})

export class codeModalComapnyDetailComponent {
  selectedOption: any;
  selectedName: string = '';
  searchControl = new FormControl();
  filteredOptions: any[] = [];
  selectedCode: string = '';
  constructor(private http: HttpClient, public dialog: MatDialog, public dialogRef: MatDialogRef<codeModalComapnyDetailComponent>) {
    console.log(this.searchControl.valueChanges)
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        switchMap(query => this.http.get<any[]>(`/codes/search?query=${query}`))
      )
      .subscribe(results => {
        console.log(results);
        this.filteredOptions = results.slice(0, 10);
      });
  }
  displayFn(option: any): string {
    return option && option.code ? option.code : '';
  }

  setSelectedOption(event: MatAutocompleteSelectedEvent) {
    this.selectedName = event.option.value.name
    this.selectedCode = event.option.value.code;
    this.selectedOption = event.option.value;
  }

  addCodes() {
    if (!this.selectedOption) {
      alert('Please select a code to add.');
      return;
    }
    this.dialogRef.close(this.selectedOption.code);


  }
}
