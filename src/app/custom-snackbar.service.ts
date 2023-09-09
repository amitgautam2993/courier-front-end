// import { Injectable } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Renderer2, RendererFactory2 } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomSnackbarService {

//   private renderer: Renderer2;

//   constructor(private _snackBar: MatSnackBar, rendererFactory: RendererFactory2) {
//     this.renderer = rendererFactory.createRenderer(null, null);
//   }

//   openSnackBar(message: string, messageType: 'error' | 'success' | 'info') {
//     let snackBarRef = this._snackBar.open(message, 'Dismiss', { duration: 4000 });

//     let snackBarContainer = document.querySelector('.mat-mdc-snack-bar-container');

//     if (snackBarContainer) {
//       let className = `custom-snackbar-${messageType}`;
//       this.renderer.addClass(snackBarContainer, className);

//       snackBarRef.afterDismissed().subscribe(() => {
//         this.renderer.removeClass(snackBarContainer, className);
//       });
//     }
//   }
// }
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CustomSnackbarService {

  private snackBarRef: MatSnackBarRef<any> | null = null;

  constructor(private _snackBar: MatSnackBar) {}

  // openSnackBar(message: string, messageType: 'error' | 'success' | 'info',actionLabel?: string, action?: () => void) {
  //   if (this.snackBarRef) {
  //     this.snackBarRef.dismiss();
  //   }

  //   this.snackBarRef = this._snackBar.open(message, 'Dismiss', {
  //     duration: 4000,
  //     panelClass: [`custom-snackbar-${messageType}`]
  //   });
  //   if (action) {
  //     this.snackBarRef.onAction().subscribe(action);
  //   }
  //   this.snackBarRef.afterDismissed().subscribe(() => {
  //     this.snackBarRef = null;
  //   });
  // }
  openSnackBar(message: string, messageType: 'error' | 'success' | 'info', action?: string, callback?: () => void) {
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
  
    this.snackBarRef = this._snackBar.open(message, action || 'Dismiss', {
      duration: 4000,
      panelClass: [`custom-snackbar-${messageType}`]
    });
  
    if (action && callback) {
      this.snackBarRef.onAction().subscribe(() => {
        callback();
      });
    }
  
    this.snackBarRef.afterDismissed().subscribe(() => {
      this.snackBarRef = null;
    });
  }
  
  
}
