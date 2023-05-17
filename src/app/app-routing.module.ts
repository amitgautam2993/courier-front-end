import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { CompanyDetailsComponentComponent } from './company-details-component/company-details-component.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent

  },
  
  {
  path: 'home',
  component: HomeComponent,
  
  },
  {

  path: 'register',
  component: RegisterComponent,
  },
  {
    path:'login',
    component: LoginComponent
  },
  {
    path:'dashboard',
    component: DashboardComponent,
     canActivate:[AuthGuard]
  
  },
  { path: 'cards/:id', component: CompanyDetailsComponentComponent }
];





@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
