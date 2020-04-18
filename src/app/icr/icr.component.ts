import { Component, OnInit, Inject } from '@angular/core';
import { ViewChild } from '@angular/core'
import {PageEvent, MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {IcrService, IcrMaster} from './icr.service';
import {Icr} from './icr';
import {Field} from './icr';
import {IcrField} from './icr-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import {Injectable} from '@angular/core';
import {IcrDialog} from './global.icr.dialog';
@Component({
  selector: 'tos-icr',
  providers: [IcrService],
  templateUrl: './icr.component.html',
  styleUrls: ['./icr.component.scss']
})
export class IcrComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('fieldTable') table: MatTable<Element>;

  private error: any;
  private headers: string[];
  private rawData: any;

  public icrs: Icr[]=[];
  private invalidIcrs: Icr[]=[];

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
  public displaySort: string="ICR #";

  public hideInvalid: boolean=true;

  descriptionFlag=false;

  public loading:boolean=true;

  public fieldList: IcrField[] = [];
  public sortBy: string[]=['Quality', 'ICR #', 'Status', 'Usage'];

  displayedColumns: string[] = ['file', 'value', 'direction', 'method'];
  public constructor(private icrService: IcrService, public dialog: MatDialog) { }
   ngOnInit(): void {
    this.loading=true;
    this.getIcrs();
  }

  public openFileUpload() {
    let element: HTMLElement =document.getElementById('upload_icr_input') as HTMLElement;
    element.click();
  }

  public handleFileInput(evt) {
    let fr:FileReader = new FileReader();
    fr.onload = (e:any) => {
        // e.target.result should contain the text
        //console.log(e.target.result);
        this.handleBulkUpload(e.target.result.split('\n'));
    };
    fr.readAsText(evt[0]);
  }
  public breakAndCombine(words:string):Array<string> {
    //First break and discard empty member and return only meaningful members
    let strAry=words.split(' ');
    let returnable:Array<string>=[];
    for (let word of strAry) {
      if (word.length>0) {
        returnable.push(word);
      }
    }
    return returnable;
  }

  /* Get an ICR by ID */
  public getIcrById(id:number):Icr {
    for (let icr of this.icrs) {
      if (icr.id===id) return icr;
    }
    return null;
  }

  /* Compare two ICRs and see if it's been isIcrUpdated
   * Assumption is that the ICR is updated, if one of the following is method
   * 1. Status changes.
   * 2. Expires changes.
   * 3. Usage changes.
   * 4. Duration changes.
   * 5. File changes.
   * 6. Value changes (Root or Routine).
   * 7. Type changes
   * 8. Description changes
   */
  public isIcrUpdated(one:Icr, two:Icr):boolean {
    if (one == null || one==undefined || two==null || two==undefined) return false;
    if (one.status != two.status) {
      console.log('status diff');
      return true;
    }
    if (one.expires != two.expires) {
      console.log('expires diff');
      return true;
    }
    if (one.usage != two.usage) {
      console.log('usage diff');
      return true;
    }
    if (one.duration != two.duration)  {
      console.log('duration diff');
      return true;
    }/*
    if (one.file != two.file)  {
      console.log('file diff');
      return true;
    }
    if (one.value != two.value) {
      console.log('value diff');
      return true;
    }*/
    if (one.type != two.type) {
      console.log('type diff');
      return true;
    }
    if (one.description.length != two.description.length)  {
      console.log('description length diff');
      return true;
    }
    for (let i=0; i<one.description.length; i++) {
      if (one.description[i] != two.description[i])  {
        console.log('description '+i+' diff');
        return true;
      }
    }
    return false;
  }

  public handleBulkUpload(texts:Array<string>) {
    let icr:Icr=new Icr();
    let icrs:Array<Icr>=[];
    let icrList:Array<string>=[];

    for (let text of texts) {
      let array=this.breakAndCombine(text);
      let descriptionFlag=false;

      if (!this.descriptionFlag && array[1]=='NAME:') {
        if (icr.id>0) {
          //icrs.push(icr); //push already created one, and then begin again.
          icrList.push(icr.id.toString());
          if (this.isIcrUpdated(icr,this.getIcrById(icr.id))) {
            icr.validated=false;
            //console.log(console.log(JSON.stringify(this.getIcrById(icr.id))));
          }
          else if (this.getIcrById(icr.id)!=null) {
            icr=this.getIcrById(icr.id);
          }

          icrs.push(icr);
        }
        icr=new Icr(); //and then, start a new ICR instance
        icr.id=Number(array[0]);
        array.splice(0,2);
        let name=array.join(' ');
        if (name!=undefined && name !=null) name=name.replace(/\r/g, '');
        icr.name=name;
      }
      else if (!this.descriptionFlag && array[0]=='CUSTODIAL' && array[1]=='PACKAGE:') {
        array.splice(0,2);
        let custodialPackage=array.join(' ');
        if (custodialPackage!=undefined && custodialPackage !=null) custodialPackage=custodialPackage.replace(/\r/g, '');
        icr.custodialPackage=custodialPackage;
      }
      else if (!this.descriptionFlag && array[0]=='SUBSCRIBING' && array[1]=='PACKAGE:') {
        array.splice(0,2);
        let subscribingPackage=array.join(' ');
        if (subscribingPackage!=undefined && subscribingPackage !=null) subscribingPackage=subscribingPackage.replace(/\r/g, '');
        icr.subscribingPackage=subscribingPackage;
      }
      else if (!this.descriptionFlag && array[0]=='USAGE:') {
        icr.usage=array[1];
        array.splice(0,3);
        let entered=text.split('ENTERED: ')[1];
        if (entered!=undefined && entered !=null) entered=entered.replace(/\r/g, '');
        icr.entered=entered;
      }
      else if (!this.descriptionFlag && array[0]=='STATUS:') {
        icr.status=this.breakAndCombine(text.split('STATUS: ')[1].split("EXPIRES:")[0]).join(' ');
        if (icr.status=='EXPIRES:') icr.status='';
        array.splice(0,3);
        let expires=text.split('EXPIRES: ')[1];
        if (expires!=undefined && expires !=null) expires=expires.replace(/\r/g, '');
        icr.expires=expires;
      }
      else if (!this.descriptionFlag && array[0]=='DURATION:') {
        icr.duration=this.breakAndCombine(text.split('DURATION: ')[1].split("VERSION:")[0]).join(' ');
        let version=text.split('VERSION: ')[1];
        if (version!=undefined && version !=null) version=version.replace(/\r/g, '');
        icr.version=version;
      }
      else if (!this.descriptionFlag && array[0]=='FILE:') {
        icr.file=array[1];
        if (icr.file=='ROOT:') icr.file='';
        let value=text.split('ROOT: ')[1];
        if (value!=undefined && value !=null) value=value.replace(/\r/g, '');
        icr.value=value;
      }
      else if (!this.descriptionFlag && array[0]=='DESCRIPTION:') {
        this.descriptionFlag=true;

        let type=array[2];
        if (type!=null && type!=undefined) {
          type=type.replace(/\r/g, '');
        }
        switch(type) {
          case 'File':
            icr.type='G';
            break;
          case 'Routine':
            icr.type='R';
            break;
          case 'Other':
            icr.type='O';
            break;
          default:
            icr.type='U';
        }
      }
      else if (this.descriptionFlag && array[0]=='ROUTINE:') {
        this.descriptionFlag=false;
        if (array[1]!=undefined && array[1].length>0 && icr.type==='R') {
          icr.value=array[1];
        }
        if (icr.id==7) console.log(icr.value);
      }
      else if (!this.descriptionFlag && array[0]=='COMPONENT:') {
        icr.tags.push(array[1]);
      }
      else if (this.descriptionFlag) {
        icr.description.push(array.join(' '));
      }
    }
    //add the last item to the ICR.
    if (icr.id>0) {
      icrList.push(icr.id.toString());
      //icrs.push(icr); //push already created one, and then begin again.
      if (this.getIcrById(icr.id)!=null && this.isIcrUpdated(icr,this.getIcrById(icr.id))) {
        icr.validated=false;
        //console.log(console.log(JSON.stringify(this.getIcrById(icr.id))));
      }
      else if (this.getIcrById(icr.id)!=null) {
        icr=this.getIcrById(icr.id);
      }
      icrs.push(icr);
    }
    let icrMaster:IcrMaster=new IcrMaster;
    icrMaster.members=icrList;
    icrMaster.id='IcrMaster';
    this.icrService.uploadBulkIcrs(icrMaster, icrs);
    //this.ngOnInit();
    return;
  }
  getIcrs(): void {
    this.icrService.downloadIcrs().subscribe(
      data => {
        //this.rawData = data
        //this.processICR();
        this.icrs=data;
        this.initialProcess();
        this.loading=false;
        this.filteredIcrs=this.icrs;
        this.pageLength=this.filteredIcrs.length;
        this.displayIcrCards();
        this.populateFieldList();
      }
    );
  }

  getCurrentIcrs():Array<Icr> {
    return this.icrs;
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

    if (this.displayQuery.includes('^')) {
      let parts=this.displayQuery.split('^');
      this.filteredIcrs=[];
      for (let icr of this.icrs) {
        if (icr.type==='R') {
          if (icr.value==undefined || icr.value==null) continue;
          console.log(icr);
          if (icr.value.toLowerCase()===parts[0].toLowerCase()) {
            console.log(icr);
            for (let i=0; i<icr.tags.length; i++) {
              if (icr.tags[i].toLowerCase().includes(parts[1].toLowerCase())) {
                this.filteredIcrs.push(icr);
              }
            }
          }
        }
      }
      return;
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
          if (this.filteredIcrs[i].value==undefined || this.filteredIcrs[i].value==null) break;
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
    else if (event.key=='Escape') {
      this.displayQuery='';
      this.queryChange();
    }
  }

  onValidate(target, flag):void {
    let targetIcr:Icr=new Icr();

    for (let icr of this.icrs) {
      if (icr.id===target.id) {
        icr.validated=flag;
        targetIcr=icr;
      }
    }
    for (let icr of this.filteredIcrs) {
      if (icr.id===target.id) {
        icr.validated=flag;
      }
    }
    this.icrService.uploadIcr(targetIcr);
  }

  setPageSizeOptions(setPageSizeOptionsInput: string):void {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
/*
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

      tempIcr.tags=new Array();
      for (let i=6; i<dataline.length; i++) {
        tempIcr.tags.push(dataline[i]);
      }
      this.icrs.push(tempIcr);
      counter++;
    }

  }
*/
isNumeric(val):boolean {
    if (val=='') return false;
    var _val = +val;
    return (val !== val + 1) //infinity check
        && (_val === +val) //Cute coercion check
        && (typeof val !== 'object'); //Array/object check
  }

  checkBoxChange():void {
    this.resetQuery();

    if (this.hideInvalid) {
      for (let [index,icr] of this.filteredIcrs.entries()) {
        if (icr.status.toLowerCase()=='withdrawn' || icr.status.toLowerCase()=='retired') {
          this.filteredIcrs.splice(index,1);
          //this.invalidIcrs.push(icr);
        }
      }
    }
    else {
      for (let icr of this.invalidIcrs) {
        this.filteredIcrs.push(icr);
      }
    }
  }

  initialProcess():void {
    let keyWords=['both','r/w', 'fileman', 'direct', 'read', '& w'];
    // Loop through and for each of global ICR, guess its fields only if it's invalidated.

    for (let i = this.icrs.length - 1; i >= 0; i--) {
      let icr=this.icrs[i];
      if (icr.status.toLowerCase()==='withdrawn' || icr.status.toLowerCase()==='retired' || icr.status.toLowerCase()==='expired' || (icr.expires!=null && icr.expires!=undefined && icr.expires.length>0)) {
        this.invalidIcrs.push(this.icrs[i]);
        this.icrs.splice(i,1);
      }
    }

    for (let [index,icr] of this.icrs.entries()) {
      // Make sure that withdrawn and retired ICRs do not displaying
      // Generate list of fields by guesstimate...
      if (icr.type==='R') {
        // look at tags and get rid of $$ and () and []
        // and auto validate routine ICRs
        let updateMe=false;

        if (!icr.validated) {
          icr.validated=true;
          updateMe=true;
        }
        for (let i=0; i<icr.tags.length; i++) {
          if (icr.tags[i].includes('$$')) {
            icr.tags[i]=icr.tags[i].split('$$')[1];
            updateMe=true;
          }
          if (icr.tags[i].includes('(')) {
            icr.tags[i]=icr.tags[i].split('(')[0];
            updateMe=true;
          }
          if (icr.tags[i].includes('[')) {
            icr.tags[i]=icr.tags[i].split('[')[0];
            updateMe=true;
          }
        }
        if (updateMe) {
          this.icrService.uploadIcr(icr);
        }
      }
      else if (icr.type==='G') {
        if (icr.fields.length>0) {
          continue;
        }
        if  (icr.description.length==0) {
          continue;
        }
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

                let newField:Field={
                  file: Number(fileNumber),
                  value: value,
                  direction: direction,
                  method: method
                };

                icr.fields.push(newField);
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

                let newField:Field={
                  file: Number(fileNumber),
                  value: value,
                  direction: direction,
                  method: 'Direct'
                };
                icr.fields.push(newField);
              }
              counter++;
            }
          }
          if (icr.fields.length>0) {
            icr.fields.sort(this.compareForSortForField);
            this.icrService.uploadIcr(icr);
          }

        }
      }
      else {
        continue;
      }
    }
  }

  compareForSortForField(a:Field, b:Field):number {
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
/*
  sortIcr(event) {
    console.log(event);
    this.displaySort=event.value;
    this.filteredIcrs.sort(this.compareForSortForIcr);
  }
  includeAllField(flds:Field[]) {
    for (let fld of flds) {
      if (fld.value=='*') return true;
    }
    return false;
  }
  compareForSortForIcr(a:Icr, b:Icr):number {
    let comparison=0;
    if (this.displaySort=='Quality') {
      if (this.displayFilter=='R') {
        if (a.tags.includes('*') && b.tags.includes('*')) {
          comparison=0;
          return comparison;
        }
        if (a.tags.includes('*')) {
          comparison=1;
        }
        if (b.tags.includes('*')) {
          comparison=-1;
        }
        if (a.tags.length>b.tags.length) {
          comparison=1;
        }
        else if (a.tags.length<b.tags.length) {
          comparison=-1;
        }
        return comparison;
      }
      else if (this.displayFilter=='G') {
        if (this.includeAllField(a.fields) && this.includeAllField(b.fields)) {
          comparison=0;
          return comparison;
        }
        if (this.includeAllField(a.fields)) {
          comparison=1;
        }
        if (this.includeAllField(b.fields)) {
          comparison=-1;
        }
        if (a.fields.length>b.fields.length) {
          comparison=1;
        }
        else if (a.fields.length<b.fields.length) {
          comparison=-1;
        }
        return comparison;
      }
      else {
        return comparison;
      }
    }
    else if (this.displaySort=='Icr #') {
      if (a.id>b.id) {
        comparison=1;
      }
      if (a.id<b.id) {
        comparison=-1;
      }
      return comparison;
    }
    else if (this.displaySort=='Status') {
      if (a.status>b.status){
        comparison=1;
      }
      else if (b.status>a.status) {
        comparison=-1;
      }
      return comparison;
    }
    else if (this.displaySort=='Usage') {
      if (a.usage>b.usage){
        comparison=1;
      }
      else if (b.usage>a.usage) {
        comparison=-1;
      }
    }
    return comparison;
  }*/
  onEditDialog(icr:Icr): void {
    const dialogRef = this.dialog.open(IcrDialog, {
      width: '650px',
      data: {
        icr: icr,
        upload: false
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result==null || result==undefined) return;

      if (result.upload) {
        icr=result;
      }
      else {
        this.icrService.getIcr(icr.id.toString()).subscribe(
          data=>{
            icr=data;
            this.table.renderRows();
          }
        );

      }
      this.table.renderRows();
      console.log('The dialog was closed');
    });
  }
}
