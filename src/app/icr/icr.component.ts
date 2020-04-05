import { Component, OnInit } from '@angular/core';
import {IcrService} from './icr.service';
import {Icr} from './icr';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'tos-icr',
  providers: [IcrService],
  templateUrl: './icr.component.html',
  styleUrls: ['./icr.component.scss']
})
export class IcrComponent implements OnInit {
  error: any;
  headers: string[];
  rawData: any;
  icrs: Icr[]=[];
  filteredIcrs: Icr[]=[];

  pageSize:number  = 30;
  pageStart:number = 0;
  pageSizeOptions: number[] = [15, 30, 60, 180, 600];
  pageIcrs: Icr[]=[];
  pageLength: number = 0;

  public displayFilter: string="B";
  public displayQuery: string="";
  public displayField: string="";

  // MatPaginator Output
  pageEvent: PageEvent;

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
        console.log(this.filteredIcrs);
      }
    );
  }

  filterChange($event) {
    this.pageStart=0;
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

    this.displayIcrCards();
    return;
  }

  displayIcrCards() {
    this.pageIcrs=[]; //clear out existing displaying cards

    for (let i=(this.pageStart*this.pageSize); i<(this.pageStart*this.pageSize)+this.pageSize; i++) {
      if (this.filteredIcrs[i]==undefined || this.filteredIcrs[i]==null) break;
      this.pageIcrs.push(this.filteredIcrs[i]);
    }

  }

  onPageChanged(event):any {
    this.pageStart=event.pageIndex;
    this.pageSize=event.pageSize;
    this.pageLength=this.filteredIcrs.length;
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
