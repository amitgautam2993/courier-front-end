import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from '@angular/material/button';
import { DashboardComponent } from './dashboard/dashboard.component'
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {MatTooltipModule,TooltipPosition} from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ModalDashboardComponent } from './dashboard/dashboard.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // import MatNativeDateModule
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatePipe } from './paginate.pipe';
// import { ModalModule } from 'ngx-bootstrap/modal';
import { editModalComapnyDetailComponent } from './company-details-component/company-details-component.component';
import { createModalComapnyDetailComponent } from './company-details-component/company-details-component.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {trackingModalComapnyDetailComponent} from './company-details-component/company-details-component.component'
import { DatePipe } from '@angular/common';
import { AutofocusDirective } from './directives/autofocus/autofocus.directive';
import { deleteModalComapnyDetailComponent } from './company-details-component/company-details-component.component';
import{ApiPrefixInterceptor} from './api-prefix.interceptor'


import { CompanyDetailsComponentComponent } from './company-details-component/company-details-component.component';






@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    CompanyDetailsComponentComponent,
    ModalDashboardComponent,
    PaginatePipe,
    editModalComapnyDetailComponent,
    createModalComapnyDetailComponent,
    trackingModalComapnyDetailComponent,
    deleteModalComapnyDetailComponent,
    AutofocusDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    FlexLayoutModule,
    MatRippleModule,
    MatIconModule,
    MatTooltipModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    DragDropModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    
    MatAutocompleteModule,
    MatSnackBarModule

  ],
  providers: [AuthService,AuthGuard,DatePipe,{provide:HTTP_INTERCEPTORS, useClass:ApiPrefixInterceptor,multi:true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
