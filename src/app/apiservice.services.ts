import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })
  export class ApiService {
    baseUrl = environment.apiUrl;
  
    constructor(private http: HttpClient) {}
  
    loginUser(bodyData: any): Observable<any> {
      return this.http.post(`/student/login`, bodyData);
    }
  
    // ... other API methods here
  }
  