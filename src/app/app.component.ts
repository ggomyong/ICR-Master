import { Component, Inject } from '@angular/core';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {IcrService} from './icr/icr.service';

@Component({
  selector: 'tos-root',
  templateUrl: './app.component.html',
  providers: [IcrService],
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent {
  title = 'ICR-Master';
  constructor(public dialog: MatDialog, private icrService:IcrService) {}

  openFileUpload() {
    let element: HTMLElement =document.getElementById('upload_icr_input') as HTMLElement;
    element.click();
  }

  handleFileInput(evt) {
    let fr:FileReader = new FileReader();
    fr.onload = (e:any) => {
        // e.target.result should contain the text
        //console.log(e.target.result);
        this.icrService.parseIcr(e.target.result.split('\n'));
    };
    fr.readAsText(evt[0]);
  }
}
