import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getUserDetails } from '../localStorageService';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { FormControl,FormGroup } from '@angular/forms';
import { editModalComapnyDetailComponent } from '../company-details-component/company-details-component.component';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-mat-toolbar',
  templateUrl: './mat-toolbar.component.html',
  styleUrls: ['./mat-toolbar.component.scss'],

})
export class MatToolbarComponent implements OnInit {
  header: string = ''
  authService: any;
  isSearchActive = false;
  deepSearchResult: any;
  options: string[] = []; // Define your options here
  searchForm: FormGroup; // Use a FormGroup
  shipperCode: any
  cnumber: any

  
  private searchQuerySubject = new Subject<string>(); // Create a subject to debounce the input


constructor(private router: Router,private http: HttpClient,public dialog: MatDialog,private datePipe: DatePipe) {
  this.searchForm = new FormGroup({
    searchQuery: new FormControl(''), // Provide a default value here
  });

  
}


ngOnInit() {
 
  

  this.header = `${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}`


  this.searchQuerySubject
  .pipe(
    debounceTime(400), // Debounce for 400ms
    distinctUntilChanged(), // Ignore repeated values
    switchMap(query =>
      this.http.get<any[]>(`/courierdata/deepsearch?query=${query}`)
        .pipe(
          catchError(error => {
            // Handle HTTP errors here
            console.error('HTTP Error:', error);
            // Return an empty array to continue the Observable stream
            return of([]);
          })
        )
    )
  )
  .subscribe(
    (result: any) => {
      // Handle the deep search result here
      this.deepSearchResult = result.data; // Assign the entire data array

      // Extract 'cnumber' values from the result and populate the 'options' array
      this.options = result.data.map((item: any) => item.courierDetails.cnumber);
   
    },
    (error) => {
      console.error('Deep Search Error:', error);
    }
  )
  
}

formatDate(dateString: string | null): string {
  if (dateString !== null) {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd MMM yyyy')!;
  }
  return ''; // Handle the case when dateString is null
}
onOptionSelected(selectedOption: any) {
  console.log('Option selected:', selectedOption);
 
  this.cnumber = selectedOption.courierDetails.cnumber;
  const id = selectedOption.id;
  console.log('cnumber:', this.cnumber);
  console.log('id:', id);

  this.dialog.open(editModalComapnyDetailComponent, {
    autoFocus: true,
    height: '400px',
    width: '600px',
    panelClass: [],
    disableClose: true,
    position: { top: '10px'},
    data: { header: 'Edit Record For Duplicate CNumber', data: selectedOption.courierDetails, shipperCode: id } // pass record object instead of { data: this.data }
  }).afterClosed().subscribe(res => {
   this.isSearchActive = false;
   this.deepSearchResult = null;
   
  },);
}
handleInputChanges(query: string) {
  console.log('Input Value:', query);
  if (query !== undefined && query !== null|| query !== '') {
    this.searchQuerySubject.next(query);
  }
}


  backtodashboard() {
    this.router.navigate(['/dashboard'])

  }

  toggleSearch(): void {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
    this.deepSearchResult = null;


    } else {
      this.header = `${getUserDetails().firstname.toUpperCase()} ${getUserDetails().lastname.toUpperCase()}`
    }
  }




}
