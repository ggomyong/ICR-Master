import { Component, OnInit } from '@angular/core';
import {IcrService} from './icr.service';
import {Icr} from './icr';

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
  icrs: Icr[];

  constructor(private icrService: IcrService) { }

  ngOnInit(): void {
    this.getIcrs();

  }

  getIcrs(): void {
    this.icrService.getIcrs().subscribe(
      data => {
        this.rawData = data
        this.processICR();
      }
    );
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
      tempIcr.description=dataline[5];
      tempIcr.components=new Array();
      for (let i=6; i<dataline.length; i++) {
        tempIcr.components.push(dataline[i]);
      }
      this.icrs.push(tempIcr);
      counter++;
    }
  }
}
