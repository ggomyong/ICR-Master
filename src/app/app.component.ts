import { Component, Inject } from '@angular/core';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { MaterialFileInputModule } from 'ngx-material-file-input';

@Component({
  selector: 'tos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent {
  title = 'ICR-Master';
  constructor(public dialog: MatDialog) {}
  openFileUpload() {
    let element: HTMLElement =document.getElementById('upload_icr_input') as HTMLElement;
    element.click();
  }
  handleFileInput(event) {
    console.log(event);
  }
}
