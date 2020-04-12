import { Component, OnInit, Inject } from '@angular/core';
import { ViewChild } from '@angular/core'
import {Icr} from './icr';
import {Field} from './icr';
import {IcrField} from './icr-field';
import {IcrService} from './icr.service';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {Injectable} from '@angular/core';
import {MatTableModule,MatTable} from '@angular/material/table';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';


@Component({
  selector: 'tos-dialog',
  providers: [IcrService],
  templateUrl: 'global.icr.dialog.html',
  styleUrls: ['./global.icr.dialog.scss']
})
@Injectable()
export class IcrDialog implements OnInit {
  displayedColumns: string[] = ['file', 'value', 'direction', 'method', 'remove'];
  message:string='';
  update:boolean =false;

  @ViewChild('table') table: MatTable<Element>;

  constructor(public dialogRef: MatDialogRef<IcrDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
  private _snackBar: MatSnackBar,
  private icrService: IcrService) {
  }

  ngOnInit() {
    console.log(this.data);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  addARow(): void {
    let newField=new Field();
    this.data.icr.fields.splice(0,0,{file: null, value: '', direction: '',method: ''});
    this.table.renderRows();
  }
  removeRow(id): void {
    this.table.renderRows();
    this.data.icr.fields.splice(id,1);
    this.table.renderRows();
  }
  updateFile(id,value){
    this.data.icr.fields[id].file=value;
    this.table.renderRows();
  }
  updateField(id,value) {
    this.data.icr.fields[id].value=value;
    this.table.renderRows();
  }
  updateDirection(id,value) {
    this.data.icr.fields[id].direction=value.value;
    this.table.renderRows();
  }
  updateMethod(id,value) {
    this.data.icr.fields[id].method=value.value;
    this.table.renderRows();
  }
  updateFields(): boolean {
    //validate members.
    /* The following conditions must be met:
    * 1. file number must be greater than 0.
    * 2. field number must not be ''
    * 3. direction must have a value.
    * 4. method must have a value.
    */
    let action='Update';
    let message='';
    let duplicateCheck=';';

    for (let [index,field] of this.data.icr.fields.entries()) {
      if (field.file==null || field.file<1) {
        message='Invalid file number, '+ field.file+ ', at entry # ' + index;
        this.generateSnackBar(message, action);
        return false;
      }
      if (field.value==null || field.value=='') {
        message='Invalid field number or index, '+ field.value+ ', at entry # ' + index;
        this.generateSnackBar(message, action);
        return false;
      }
      if (field.value.includes('\"')) {
        message='Do not include quotations for '+ field.value+ ' at entry # ' + index;
        this.generateSnackBar(message, action);
        return false;
      }
      if (field.value.includes('\'')) {
        message='Do not include quotations for '+ field.value+ ' at entry # ' + index;
        this.generateSnackBar(message, action);
        return false;
      }
      if (field.direction==null || field.direction=='') {
        message='Invalid direction, '+ field.direction+ ', at entry # ' + index;
        this.generateSnackBar(message, action);
        return false;
      }
      if (field.method==null || field.method=='') {
        message='Invalid method, '+ field.method+ ', at entry # ' + index;
        this.generateSnackBar(message, action);
        return false;
      }

      if (duplicateCheck.includes(';'+ field.file+'^'+field.value+';')) {
        message='Duplicate in the array for file #'+field.file+' and field #'+field.value+' at node '+index;
        this.generateSnackBar(message, action);
        return false;
      }
      else {
        duplicateCheck+=field.file+'^'+field.value+';';
      }
    }
    this.data.icr.fields.sort(this.compareForSort);
    message='Update successful!';
    this.generateSnackBar(message, action);
    this.icrService.uploadIcr(this.data.icr);
    this.data.upload=true;
    return true;
  }
  generateSnackBar(message, action) {
    this._snackBar.open(message, action, {duration: 5000});
  }
  compareForSort(a:Field, b:Field):number {
    let comparison = 0;
    if (a.file>b.file) {
      comparison=1;
    }
    else if (a.file<b.file) {
      comparison=-1;
    }
    if (comparison==0) {
      if (a.value>b.value) {
        comparison=1;
      }
      else if (a.value<b.value) {
        comparison=-1;
      }
    }
    return comparison;
  }
  onValidate(flag):void {
    if (this.updateFields()) {
      this.data.icr.validated=flag;
      this.icrService.uploadIcr(this.data.icr);
      this.data.upload=true;
    }
  }
}
