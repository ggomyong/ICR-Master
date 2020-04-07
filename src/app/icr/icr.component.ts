import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core'
import {PageEvent, MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {IcrService} from './icr.service';
import {Icr} from './icr';
import {IcrField} from './icr-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';

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

  constructor(private icrService: IcrService) { }

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
      }
    );
  }

  populateFieldList() {
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

  resetQuery() {
    this.filterChange({value: this.displayFilter});
  }

  filterChange($event) {
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

  queryChange(event) {
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

  displayIcrCards() {
    this.pageIcrs=[]; //clear out existing displaying cards
    this.pageLength=this.filteredIcrs.length;
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

  setPageSizeOptions(setPageSizeOptionsInput: string) {
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

      tempIcr.components=new Array();
      for (let i=6; i<dataline.length; i++) {
        tempIcr.components.push(dataline[i]);
      }
      this.icrs.push(tempIcr);
      counter++;
    }

  }
}
