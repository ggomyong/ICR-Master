import { Component, OnInit, Inject } from '@angular/core';
import { ViewChild } from '@angular/core'
import {PageEvent, MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {IcrService} from './icr.service';
import {Icr} from './icr';
import {Field} from './icr';
import {IcrField} from './icr-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'tos-icr',
  providers: [IcrService],
  templateUrl: './icr.component.html',
  styleUrls: ['./icr.component.scss']
})
export class IcrComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;

  private error: any;
  private headers: string[];
  private rawData: any;

  public icrs: Icr[]=[];
  public filteredIcrs: Icr[]=[];

  public pageSize:number  = 30;
  public pageStart:number = 0;

  public pageSizeOptions: number[] = [15, 30, 60, 180, 600];
  public pageIcrs: Icr[]=[];
  public pageLength: number = 0;
  // MatPaginator Output
  public pageEvent: PageEvent;

  public displayFilter: string="B";
  public displayQuery: string="";
  public displayField: string="";


  public fieldList: IcrField[] = [];
  displayedColumns: string[] = ['file', 'value', 'direction', 'method'];
  constructor(private icrService: IcrService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getIcrs();
  }

  getIcrs(): void {
    this.icrService.getIcrs().subscribe(
      data => {
        this.rawData = data
        this.processICR();

        this.filteredIcrs=this.icrs;
        this.pageLength=this.filteredIcrs.length;

        this.displayIcrCards();
        this.populateFieldList();
        this.guessFields()
      }
    );
  }

  populateFieldList():void {
    this.fieldList=[]; //empty out whatever is in the array.

    //push common fields into the array
    this.fieldList.push({value: '#', external: 'ICR #'});
    this.fieldList.push({value: 'name', external: 'ICR Name'});
    this.fieldList.push({value: 'desc', external: 'Description'});

    if (this.displayFilter=='B') {
      this.fieldList.push({value: 'val', external: 'ICR Value'});
      this.fieldList.push({value: 'valdesc', external: 'ICR Value + Description'});
    }
    else if (this.displayFilter=='R') {
      this.fieldList.push({value: 'val', external: 'Routine'});
      this.fieldList.push({value: 'valdesc', external: 'Routine + Description'});
    }
    else if (this.displayFilter=='G') {
      this.fieldList.push({value: 'val', external: 'Global Root'});
      this.fieldList.push({value: 'valdesc', external: 'Global Root + Description'});
    }
    if (this.displayField=='' || this.displayField==undefined || this.displayField==null) this.displayField='val';
  }

  resetQuery():void {
    this.filterChange({value: this.displayFilter});
  }

  filterChange($event):void {
    this.pageStart=0;
    this.displayFilter=$event.value;
    this.displayQuery='';
    this.populateFieldList();

    if ($event.value=='B') {
      this.filteredIcrs=this.icrs;

      this.pageLength=this.filteredIcrs.length;
      this.displayIcrCards();
      return;
    }

    this.filteredIcrs=[];

    for (let i=0; i<this.icrs.length; i++) {
      if (this.icrs[i].type==$event.value) {
        this.filteredIcrs.push(this.icrs[i]);
      }
    }
    this.pageLength=this.filteredIcrs.length;
    this.pageStart=0;
    this.paginator.firstPage();
    this.displayIcrCards();

    return;
  }

  queryChange():void {
    let tempIcrs:Icr[]=[];
    let descs:string='';

    if (this.displayQuery == '') {
      this.filteredIcrs=this.icrs;
      this.paginator.firstPage();
      this.displayIcrCards();
    }

    for (let i=0; i<this.filteredIcrs.length; i++) {
      descs=this.filteredIcrs[i].description.join('\n');

      switch(this.displayField) {
        case '#':
          if (this.filteredIcrs[i].id.toString().toLowerCase().includes(this.displayQuery.toLowerCase())) {
            tempIcrs.push(this.filteredIcrs[i]);
          }
          break;
        case 'name':
          if (this.filteredIcrs[i].name.toLowerCase().includes(this.displayQuery.toLowerCase())) {
            tempIcrs.push(this.filteredIcrs[i]);
          }
          break;
        case 'valdesc':
          if (this.filteredIcrs[i].value.toLowerCase().includes(this.displayQuery.toLowerCase()) || descs.toLowerCase().includes(this.displayQuery.toLowerCase())) {
            tempIcrs.push(this.filteredIcrs[i]);
          }
          if (this.filteredIcrs[i].type=='G') {
            if (this.filteredIcrs[i].file.includes(this.displayQuery.toLowerCase())) {
              tempIcrs.push(this.filteredIcrs[i]);
            }
          }
          break;
        case 'val':
          if (this.filteredIcrs[i].value.toLowerCase().includes(this.displayQuery.toLowerCase())) {
            tempIcrs.push(this.filteredIcrs[i]);
          }
          if (this.filteredIcrs[i].type=='G') {
            if (this.filteredIcrs[i].file.includes(this.displayQuery.toLowerCase())) {
              tempIcrs.push(this.filteredIcrs[i]);
            }
          }
          break;
        case 'desc':
          if (descs.toLowerCase().includes(this.displayQuery.toLowerCase())) {
            tempIcrs.push(this.filteredIcrs[i]);
            break;
          }
          break;
      }
    }
    this.paginator.firstPage();
    this.filteredIcrs=[];
    this.filteredIcrs=tempIcrs
    this.displayIcrCards();
  }

  displayIcrCards():void {
    this.pageIcrs=[]; //clear out existing displaying cards
    this.pageLength=this.filteredIcrs.length;
    /*if (this.filteredIcrs.length==0) {
      this.filterChange({value: this.displayFilter});
    }*/
    for (let i=(this.pageStart*this.pageSize); i<(this.pageStart*this.pageSize)+this.pageSize; i++) {
      if (this.filteredIcrs[i]==undefined || this.filteredIcrs[i]==null) break;
      this.pageIcrs.push(this.filteredIcrs[i]);
    }

  }

  onPageChanged(event):any {
    this.pageStart=event.pageIndex;
    this.pageSize=event.pageSize;
    this.displayIcrCards();
    return event;
  }

  onKeydown(event): void {
    if (event.key=='Enter') {
      this.queryChange();
    }
  }

  onValidate(target, flag):void {
    for (let icr of this.icrs) {
      if (icr.id===target.id) {
        icr.validated=flag;
      }
    }
    for (let icr of this.filteredIcrs) {
      if (icr.id===target.id) {
        icr.validated=flag;
      }
    }
  }

  setPageSizeOptions(setPageSizeOptionsInput: string):void {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  processICR(): void {
    let tempArray = new Array();
    tempArray=this.rawData.split('\n');
    let counter: number;
    counter=0;
    this.icrs=[];

    for (let entry of tempArray) {
      if (counter==0){
        counter++;
        continue;
      }
      let dataline=new Array();
      dataline=entry.split('\t');
      let tempIcr: Icr;
      tempIcr=new Icr();

      tempIcr.id=dataline[0];
      tempIcr.name=dataline[1];
      tempIcr.type=dataline[2];
      tempIcr.value=dataline[3];
      tempIcr.file=dataline[4];
      let tempDesc:string=dataline[5];
      tempIcr.description=tempDesc.split('\\n');
      tempIcr.validated=(tempIcr.type=='R' ? true: false);
      tempIcr.fields=[];
      tempIcr.fieldIndex=[];

      tempIcr.tags=new Array();
      for (let i=6; i<dataline.length; i++) {
        tempIcr.tags.push(dataline[i]);
      }
      this.icrs.push(tempIcr);
      counter++;
    }

  }

isNumeric(val):boolean {
    if (val=='') return false;
    var _val = +val;
    return (val !== val + 1) //infinity check
        && (_val === +val) //Cute coercion check
        && (typeof val !== 'object'); //Array/object check
  }



  guessFields():void {
    let keyWords=['both','r/w', 'fileman', 'direct', 'read', '& w'];
    // Loop through and for each of global ICR, guess its fields only if it's unvalidated.
    for (let icr of this.icrs) {
      if (icr.type==='G') {
        if (!icr.validated) {
          //Loop through description array, we're looking for a line that starts with a number
          // and has verbiages such as Direct, Fileman, and/or Read.
          // has to be on the same line, and cannot be on the multiple lines.
          for (let description of icr.description) {
            let tempArry = description.split(' ');
            if (this.isNumeric(tempArry[0])) {
              let test=false;
              for (let word of keyWords) {
                test=description.toLowerCase().includes(word);
                if (test) {
                  break;
                }
              }
              if (test) {
                let fileNumber=icr.file;
                let value=tempArry[0];
                let direction;
                let lowerDescription=description.toLowerCase();
                let method;

                if (lowerDescription.includes('read')) {
                  direction='Read';
                }
                if (lowerDescription.includes('write')) {
                  direction='Write';
                }
                if (lowerDescription.includes('both') || description.toLowerCase().includes('& w')) {
                  direction='Both';
                }

                method='Fileman';
                if (lowerDescription.includes('direct')) {
                  method='Direct';
                }
                if (lowerDescription.includes('fileman')) {
                  method='Fileman';
                }

                let hash=fileNumber.toString()+'^'+value.toString();

                if (!icr.fieldIndex.includes(hash)) {
                  let newField:Field={
                    file: Number(fileNumber),
                    value: value,
                    direction: direction,
                    method: method
                  };

                  icr.fields.push(newField);
                  icr.fieldIndex.push(hash);
                }


              }
            }
            //Not a number, but we could check for cross-reference
            let tempAry2:Array<string>=[];

            if (description.includes('\'')) {
              tempAry2=description.split('\'')

            }
            if (description.includes('\"')) {
              tempAry2=description.split('\"')
            }
            if (tempAry2.length<3) { continue; }
            let counter=0;
            for (let x of tempAry2) {
              if (counter>0 && counter%2==1) {
                let fileNumber=icr.file;
                let value=x;
                let direction='Read';
                let hash=fileNumber.toString()+'^'+value.toString();
                if (!icr.fieldIndex.includes(hash)) {
                  let newField:Field={
                    file: Number(fileNumber),
                    value: value,
                    direction: direction,
                    method: 'Direct'
                  };
                  icr.fields.push(newField);
                  icr.fieldIndex.push(hash);
                }
              }
              counter++;
            }
          }
          icr.fields.sort(function (a, b) {
            let x=a.value;
            let y=b.value;

            let comparison=0;
            if (x>y) {
              return 1;
            }
            else if (x<y) {
              return -1;
            }
            return 0;
          });
        }
      }
      else {
        continue;
      }
    }
  }

  onEditDialog(icr:Icr): void {
    const dialogRef = this.dialog.open(IcrDialog, {
      width: '250px',
      data: icr.fields
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'icr-dialog',
  templateUrl: 'global.icr.dialog.html',
})
export class IcrDialog implements OnInit {
  displayedColumns: string[] = ['file', 'value', 'direction', 'method'];
  dataSource: MatTableDataSource<Field>;

  constructor(public dialogRef: MatDialogRef<IcrDialog>,@Inject(MAT_DIALOG_DATA) public data: Array<Field>) {

  }
  ngOnInit() {
    console.log(this.data);
    this.dataSource= new MatTableDataSource(this.data);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
