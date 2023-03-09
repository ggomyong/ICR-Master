import { Component, Inject } from '@angular/core';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {IcrService} from './icr/icr.service';
import {IcrComponent} from './icr/icr.component';

@Component({
  selector: 'tos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent {
  title = 'ICR-Master';
  constructor() {}


}
