import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import {PageEvent, MatPaginator} from '@angular/material/paginator';
import {IcrService, IcrMaster} from './icr.service';
import {GlobalReference, Icr, SubscribingPackage, Tag, Variable} from './icr';
import {Field} from './icr';
import {IcrField} from './icr-field';
import {MatDialog} from '@angular/material/dialog';
import { MatTableDataSource, MatTable } from '@angular/material/table';

import {IcrDialog} from './global.icr.dialog';
@Component({
  selector: 'tos-icr',
  templateUrl: './icr.component.html',
  styleUrls: ['./icr.component.scss']
})
export class IcrComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  obs: Observable<any>;
  dataSource: MatTableDataSource<Icr>;
  @ViewChild('fieldTable') table: MatTable<Element>;

  private error: any;
  private headers: string[];
  private rawData: any;

  public icrs: Icr[]=[];
  public invalidIcrs: Icr[]=[];
  public pageSize:number  = 30;
  public pageStart:number = 0;
  public pageIndex:number=0
  public previousPageIndex:number=0
  public pageSizeOptions: number[] = [15, 30, 60, 180, 600];
  public pageIcrs: Icr[]=[];
  public pageLength: number = 0;
  // MatPaginator Output
  public pageEvent: PageEvent;

  public displayFilter: string="B";
  public displayQuery: string="";
  public displayField: string="";
  public displaySort: string="quality";

  public hideInvalid: boolean=true;

  descriptionFlag=false;

  public loading:boolean=true;
  public breakpoint:number=3;

  public fieldList: IcrField[] = [{value: '#',external: 'ID'},{value: 'val', external: 'Value'}, {value: 'desc', external: 'Description'}, {value: 'valdesc', external: 'Value+Description'}, {value: 'keyword', external: 'Keyword'}];
  public sortBy: IcrField[]=[{value: 'id', external: 'ID'}, {value: 'quality', external: 'Quality'}];
 
  public constructor(private icrService: IcrService, public dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef) { }
   ngOnInit(): void {
    this.loading=true;
    this.displayField='val';
    this.getIcrs();

    this.onResize(null);
  }


    onResize($event) {
      if (window.innerWidth<=910) {
        this.breakpoint=1;
      }
      else if (window.innerWidth<=1274) {
        this.breakpoint=2;
      }
      else {
        this.breakpoint=3;
      }
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
    words = words.replace(/(\r\n|\n|\r)/gm, "");
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
    if (one.value != two.value) {
      console.log('value diff');
      return true;
    }
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
    let field: Field = new Field();
    let tag: Tag = new Tag();
    let variable: Variable = new Variable();
    let subscribingPackage: SubscribingPackage = new SubscribingPackage();

    let variableDescription: boolean = false;
    let fieldDescription: boolean = false;
    let globalDescription: boolean = false;
    let componentDescription: boolean = false;
    let subscribingDetails: boolean = false;

    let globalReference: GlobalReference = new GlobalReference();

    let icrList:Array<string>=[];

    for (let text of texts) {
      let array=this.breakAndCombine(text);
      if (array.includes('STATUS:')) {
        this.descriptionFlag = false;
        variableDescription = false;
        fieldDescription = false;
        globalDescription = false;
        componentDescription = false;
          let temp1= JSON.parse(JSON.stringify(array))
          temp1.splice(temp1.findIndex((node)=>node=='DURATION:'), temp1.length).join(' ')
          icr.status=temp1.splice(1, temp1.length).join(' ')
      }
      if (array.includes('DURATION:')) {
        this.descriptionFlag = false;
        variableDescription = false;
        fieldDescription = false;
        globalDescription = false;
        componentDescription = false;
        array.splice(0, array.findIndex((node)=>node=='DURATION:')+1)
        icr.duration = array.join(' ')
      }

      if (!this.descriptionFlag) {
        if (array[0]=="NUMBER:") {
          fieldDescription = false;
          variableDescription = false;
          globalDescription = false;
          componentDescription= false;
          subscribingDetails = false;

          if (icr.id>0) {
            icrList.push(icr.id.toString());
            if (this.isIcrUpdated(icr,this.getIcrById(icr.id))) {
              icr.validated=false;
              //console.log(console.log(JSON.stringify(this.getIcrById(icr.id))));
            }
            //push the last globalreference
            if (globalReference.reference) {
              if (field.value) {
                globalReference.fields.push(field)
                field = new Field();
              }
              icr.globalReferences.push(globalReference)
              globalReference = new GlobalReference();
            }
            //push the last tag
            if (tag.name) {
              if (variable.name) {
                tag.variables.push(variable)
              }
              icr.tags.push(tag);
              tag = new Tag();
              variable = new Variable();
            }
            //push the last subscribing package
            if (subscribingPackage.name) {
              icr.subscribingPackages.push(subscribingPackage);
              subscribingPackage = new SubscribingPackage();
            }
            if (icr.globalReferences && icr.globalReferences.length>0 && icr.file=='') {
              icr.file='0'
              if (!icr.value.includes('DD') && icr.value.includes('(')) {
                let f = icr.value.substring(icr.value.indexOf('(')+1,icr.value.indexOf(','))
                if (!isNaN(Number(f))) {
                  icr.file = f;
                }else {
                  switch(f) {
                    case 'PSRX(':
                      icr.file = '52'
                      break;
                    case 'ICD9(':
                      icr.file = '80'
                      break;
                    case 'LAB(':
                      icr.file= '60'
                      break;
                    case 'PXRMINDX(':
                      break;
                    case 'A7RCP(':
                      break;
                    case 'XUSEC(':
                      icr.file='3.081';
                      break;
                    case 'DPT(':
                      icr.file='2'
                      break;
                  }
                }
                // recursive updating of fields
                if (icr.file) {
                  for (let ref of icr.globalReferences) {
                    for (let field of ref.fields) {
                      if (!field.file) {
                        field.file = Number(icr.file);
                      }
                    }
                  }
                }
              }
            }
            icrs.push(icr);
          }
          icr=new Icr(); //and then, start a new ICR instance
          icr.id=Number(array[1]);
        }
        if (array.includes("FILE") && array.includes('NUMBER:') && array.join(' ').includes('FILE NUMBER:')) {
          icr.file = array[array.findIndex((node)=> node=='NUMBER:')+1];
        }
        if (array.includes('GLOBAL') && array.includes('ROOT:') && array.join(' ').includes('GLOBAL ROOT:')) {
          icr.value=array[array.findIndex((node)=>node=='ROOT:')+1];
        }
        if (array.includes('ROUTINE:')) {
          icr.value = array[array.findIndex((node)=>node=='ROUTINE:')+1]
        }
        if (array.includes('COMPONENT/ENTRY') && array.includes('POINT:')) {
          componentDescription = false;
          if (tag.name) {
            if (variable.name) {
              tag.variables.push(variable);
              variable = new Variable();
            }
            icr.tags.push(tag);
          }
          tag = new Tag()
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='POINT:')+1)
          tag.name = temp.join(' ')
        }
        
        if (array.includes('VARIABLES:')) {
          variableDescription = false;
          componentDescription = false;
          if (variable.name) {
            tag.variables.push(variable);
            variable = new Variable();
          }

          variable.name = array[array.findIndex((node)=>node=='VARIABLES:')+1]
          if (array.includes('TYPE:')) {
            variable.type = array[array.findIndex((node)=>node=='TYPE:')+1]
          }
        }
        if (array.includes('USAGE:')) {
          icr.usage = array[array.findIndex((node)=>node=='USAGE:')+1];
        }
        if (array.includes('CUSTODIAL') && array.includes('ISC:')) {
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='ISC:')+1)
          temp.splice(temp.findIndex((node)=>node=='USAGE:'), temp.length)
          icr.custodialIsc = temp.join(' ')
        }
        if (array.includes('CUSTODIAL') && array.includes('PACKAGE:') && array.join(' ').includes('CUSTODIAL PACKAGE:')) {
          icr.custodialPackage = array[array.findIndex((node)=> node=='PACKAGE:')+1];
        }
        
        if ( array.includes('TYPE:')  && !array.includes('VARIABLES:')) {
          icr.type= array[array.findIndex((node)=>node=='TYPE:')+1];
          if (icr.type.toLocaleLowerCase()=='remote') {
            icr.type='Remote Procedure'
          }
        }
        if (array.includes('REMOTE') && array.includes('PROCEDURE:') && array.join(' ').includes('REMOTE PROCEDURE:')) {
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='PROCEDURE:')+1)
          if (temp.join(' ').includes(':')) {
            temp.join(' ').split(':')[0].split(' ')
            temp.splice(temp.length-2,2)
          }
          icr.remoteProcedure = temp.join(' ')
            icr.value = icr.remoteProcedure
        }
        if (array.includes('NAME:') && !array.join(' ').includes('FIELD NAME:')) {
          let temp: string[] = JSON.parse(JSON.stringify(array))
          let name = temp.splice(temp.findIndex((node)=>node==='NAME:')+1,temp.length)
          let index = name?.join(' ')?.split(':')[0]?.split(' ')
          if (index.includes('ORIGINAL') && index.includes('NUMBER') && index.join(' ').includes('ORIGINAL NUMBER')) {
            index.splice(index.length-2, 2);
          }
          icr.name = index.join(' ')
        }
        if (array.includes('GLOBAL') && array.includes('REFERENCE:') && array.join(' ').includes('GLOBAL REFERENCE:')) {
          globalDescription = false;
          if (globalReference.reference) {
            if (field.value) {
              globalReference.fields.push(field)
              field = new Field();
            }
            icr.globalReferences.push(globalReference);
          }
          globalReference = new GlobalReference();
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='REFERENCE:')+1)
          globalReference.reference = temp.join(' ')
          globalReference.fields = [];
          globalReference.description = [];
        }
        if (array.includes('FIELD') && array.includes('NUMBER:') && array.join(' ').includes('FIELD NUMBER:')) {
          fieldDescription = false;
          if (field.value) {
            globalReference.fields.push(field);
          }
          
          field = new Field();
          field.value = array[array.findIndex((node)=>node=='NUMBER:')+1];
          field.file = Number(icr.file)
        }
        if (array.includes('FIELD') && array.includes('NAME:') && array.join(' ').includes('FIELD NAME:')) {
          fieldDescription = false;
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='NAME:')+1)
          field.name = temp.join(' ')
        }
        if (array.includes('LOCATION:')) {
          field.location = array[array.findIndex((node)=>node=='LOCATION:')+1];
          
        }
        if (array.includes('ACCESS:')){
          let method = array.join(' ').split('ACCESS:')[1].toLocaleLowerCase();
          
          if (method.includes('read')) {
            if (method.includes('write')) {
              field.direction='Both'
            }
            else {
              field.direction='Read'
            }
          } else if (method.includes('write')) {
            field.direction='Write'
          } else if (method.includes('r/w')) {
            field.direction='Both'
          }
          if (method.includes('fileman')) {
            if (method.includes('direct')) {
              field.method='Both'
            } else {
              field.method='Fileman'
            }
          } else if (method.includes('direct')) {
            field.method='Direct'
          }
        }
        if (array.includes('SUBSCRIBING') && array.includes('PACKAGE:') && array.join(' ').includes('SUBSCRIBING PACKAGE:')) {
          variableDescription = false
          globalDescription = false;
          fieldDescription = false;
          subscribingDetails = false;
          if (subscribingPackage && subscribingPackage.name && subscribingPackage.name.length>0) {
            icr.subscribingPackages.push(subscribingPackage)
            console.log(subscribingPackage);
            subscribingPackage = new SubscribingPackage();
          }
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, 2)
          if (temp.includes('ISC:')) {
            temp.splice(temp.findIndex((node)=>node=='ISC:'), temp.length).join(' ')
            subscribingPackage.name =temp.join(' ')
          }
          subscribingPackage.name = temp.join(' ')
        }
        if (array.join(' ').includes('DATE ACTIVATED:')) {
          icr.dateActivated = array.join(' ').split('DATE ACTIVATED:')[1];
        }
        if (subscribingDetails || array.join(' ').includes('SUBSCRIBING DETAILS:')) {
          subscribingDetails = true;
          let temp1
          if (array.join(' ').includes('SUBSCRIBING DETAILS:')) {
            temp1 = array.join(' ').split('SUBSCRIBING DETAILS:')[1];
          }
          else {
            temp1 = array.join(' ')
          }
          subscribingPackage.details.push(temp1);
        }
        
        if (array.includes('ISC:') && !array.includes('CUSTODIAL')) {
          let temp=JSON.parse(JSON.stringify(array))
          subscribingPackage.isc=temp.splice(array.findIndex((node)=>node=='ISC:')+1, temp.length).join(' ')
        }
        if (array.includes('DESCRIPTION:') && array.includes('GENERAL')) {
          this.descriptionFlag=true;
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, 2);
          icr.description.push(temp.join(' '))
          continue;
        }
        if (componentDescription || (array.includes('COMPONENT') && array.includes('DESCRIPTION:') && array.join(' ').includes('COMPONENT DESCRIPTION:') )) {
          componentDescription = true;
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='DESCRIPTION:')+1)
          tag.description.push(temp.join(' '))
        }
        if (fieldDescription || (array.includes('FIELD') && array.includes('DESCRIPTION:') && array.join(' ').includes('FIELD DESCRIPTION:'))) {
          fieldDescription = true;
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='DESCRIPTION:')+1)
          field.description.push(temp.join(' '))
        }
        if (variableDescription || (array.includes('VARIABLES') && array.includes('DESCRIPTION:')&& array.join(' ').includes('VARIABLES DESCRIPTION:'))) {
          variableDescription = true;
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='DESCRIPTION:')+1)
          variable.description.push(temp.join(' '))
        }
        if (globalDescription || (array.includes('GLOBAL') && array.includes('DESCRIPTION:')&& array.join(' ').includes('GLOBAL DESCRIPTION:'))) {
          globalDescription = true;
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='DESCRIPTION:')+1)
          globalReference.description.push(temp.join(' '))
        }
        if (!array.includes('CUSTODIAL') && array.includes('ISC:') && subscribingPackage.name && array.join(' ').includes('CUSTODIAL ISC:')) {
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='ISC:')+1)
          subscribingPackage.isc = temp.join(' ')
          icr.subscribingPackages.push(subscribingPackage);
          subscribingPackage = new SubscribingPackage();
        }
        if (array.includes('DBIC') && array.includes('APPROVAL') && array.includes('STATUS:') && array.join(' ').includes('DBIC APPROVAL STATUS:')) {
          icr.dbicStatus = array[array.findIndex((node)=>node=='STATUS:')+1]
        }
        if (array.includes('KEYWORDS:')) {
          let temp = JSON.parse(JSON.stringify(array))
          temp.splice(0, temp.findIndex((node)=>node=='KEYWORDS:')+1)
          icr.keywords.push(temp.join(' '))
        }
        if (array.join(' ').includes('DATE CREATED:')) {
          let dateIndex = array.findIndex((node)=>node =='CREATED:')+1
          icr.dateCreated =`${array[dateIndex]}  ${array[dateIndex+1]} ${array[dateIndex+2]}`
        }
      }
      else {
          icr.description.push(array.join(' '));
      }
    }
    //add the last item to the ICR.
    if (icr.id>0) {
      if (globalReference.reference) {
        if (field.value) {
          globalReference.fields.push(field);
        }
        icr.globalReferences.push(globalReference)
      }
      //push the last tag
      if (tag.name) {
        if (variable.name) {
          tag.variables.push(variable)
        }
        icr.tags.push(tag);
        tag = new Tag();
        variable = new Variable();
      }
      //push the last subscribing package
      if (subscribingPackage.name) {
        icr.subscribingPackages.push(subscribingPackage);
        subscribingPackage = new SubscribingPackage();
      }

      icrList.push(icr.id.toString());
      icrs.push(icr);
    }
    let icrMaster:IcrMaster=new IcrMaster;
    icrMaster.members=icrList;
    icrMaster.id='IcrMaster';
    console.log(icrs);
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
        this.dataSource = new MatTableDataSource<Icr>(this.icrs);
        this.sortDataSource();
        this.changeDetectorRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();

        this.sortDataSource();

        this.dataSource.filterPredicate =(data: Icr, filter: string) => {
          if (this.hideInvalid) {
            if (data.status?.toLowerCase()==='withdrawn' || data.status?.toLowerCase()==='expired') {
              return false;
            }
          }

          filter=filter?.toLowerCase();
          if (this.displayFilter.toUpperCase()=='R' && data.tags?.length<=0) return false;
          if (this.displayFilter.toUpperCase()=='G' && data.globalReferences?.length<=0) return false;
          if (this.displayFilter.toUpperCase()=='RPC' && data.remoteProcedure?.length<=0) return false;
          if (filter=='*@*@*#@!!') return true;

          if(this.displayField==='#') {
            return data.id.toString()===filter;
          }
          else if (this.displayField==='val') {
            if (data.value==undefined || data.value==null) return false;
            if (data.value.trim()?.toLowerCase().substr(0, filter.length) === filter) return true;
            if (data.file != undefined && data.file != null) {
              if (data.file.toString() === filter) return true;
            }
            return false;
          }
          else if (this.displayField=='desc') {
            for (let desc of data.description) {
              if (desc.trim()?.toLowerCase().includes(filter)) return true;
            }
            return false;
          }
          else if (this.displayField=='valdesc') {
            if (data.value!=undefined || data.value!=null) {
              if (data.value.trim()?.toLowerCase().substr(0, filter.length) === filter) return true;
              if (data.file != undefined && data.file != null) {
                if (data.file.toString() === filter) return true;
              }
            }
            for (let desc of data.description) {
              if (desc.trim()?.toLowerCase().includes(filter.toLowerCase())) return true;
            }
            return false;
          }
          else if (this.displayField=='keyword') {
            for (let keyword of data.keywords) {
              if (keyword.trim()?.toLowerCase().includes(filter)) return true;
            }
            return false;
          }
        }
      }
    );
  }

  getCurrentIcrs():Array<Icr> {
    return this.icrs;
  }

  resetQuery():void {
    this.displayQuery='';
    this.dataSource.filter = '*@*@*#@!!';
  }

  /*displayIcrCards():void {
    this.pageIcrs=[]; //clear out existing displaying cards
    this.pageLength=this.filteredIcrs.length;

    /*if (this.filteredIcrs.length==0) {
      this.filterChange({value: this.displayFilter});
    }
    for (let i=(this.pageStart*this.pageSize); i<(this.pageStart*this.pageSize)+this.pageSize; i++) {
      if (this.filteredIcrs[i]==undefined || this.filteredIcrs[i]==null) break;
      this.pageIcrs.push(this.filteredIcrs[i]);
    }

  }*/
  sortDataSource() {
    //this.dataSource.sort.sort(<MatSortable>({ id: id, start: start }));
    if (this.displaySort=='id') {
      this.dataSource.data.sort((a: any, b: any) => {
          if (a.id < b.id) {
              return -1;
          } else if (a.id > b.id) {
              return 1;
          } else {
              return 0;
          }
      });
    }
    else if (this.displaySort=='quality') {
      this.dataSource.data.sort((a: any, b: any) => {
          if (a.quality < b.quality) {
              return 1;
          } else if (a.quality > b.quality) {
              return -1;
          } else {
              return 0;
          }
      });
    }
    //this.dataSource.connect().next(this.icrs);
    //this.paginator._changePageSize(this.paginator.pageSize);
  }

  applyFilter(filterValue): void {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue?.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  sortChange(): void {
    this.sortDataSource();
    this.resetQuery();
  }
  filterChange(val): void {
    this.displayFilter=val;
    switch(this.displayFilter){
      case 'R':
        this.fieldList[1].external='Routine';
        break;
      case 'G':
        this.fieldList[1].external='Global';
        break;
      case 'RPC':
        this.fieldList[1].external='RPC';
        break;
      default:
        this.fieldList[1].external='Value';
        break;
    }
    this.resetQuery();
  }

  checkBoxChange():void {
    if (this.invalidIcrs.length>0) {

      for (let icr of this.invalidIcrs) {
        icr.quality=-100000;
        this.icrs.push(icr);
      }
      this.invalidIcrs=[];
    }
    this.displayQuery='';
    //this.changeDetectorRef.detectChanges();
    this.dataSource.filter = '*@*@*#@!!';
  }

  onValidate(target, flag):void {
    let targetIcr:Icr=new Icr();

    for (let icr of this.icrs) {
      if (icr.id===target.id) {
        icr.validated=flag;
        targetIcr=icr;
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

  initialProcess():void {
    let keyWords=['both','r/w', 'fileman', 'direct', 'read', '& w'];
    // Loop through and for each of global ICR, guess its fields only if it's invalidated.

    for (let i = this.icrs.length - 1; i >= 0; i--) {
      let icr=this.icrs[i];
      //retired ICRs will not be considered as invalid
      //ICRs that have EXPIRES field wlil not be considered as invalid
      if (icr.status?.toLowerCase()==='withdrawn' || icr.status?.toLowerCase()==='expired') {
        this.invalidIcrs.push(this.icrs[i]);
        this.icrs.splice(i,1);
        continue;
      }
      if (icr==undefined || icr==null) continue;
      let quality=0;
      if (icr.status?.toLowerCase()==='active') {
        quality=100000;
      }
      else if (icr.status?.toLowerCase()==='retired') {
        quality=-1000;
      }

      if (icr.usage?.toLowerCase()==='supported') {
        quality=quality+10000;
      }
      else if (icr.usage?.toLowerCase()==='controlled') {
        quality=quality+9000;
      }
      else if (icr.usage?.toLowerCase()==='private') {
        quality=quality+8000;
      }

      if (icr.dbicStatus?.toLowerCase() === 'approved') {
        quality = quality + 10000;
      }

      if (icr.expires!=undefined && icr.expires!=null && icr.expires!='') {
        quality=0;
      }

      for (let fld of icr.fields) {
        if (fld.value=='*') {
          quality=quality+999;
        }
      }
      if (icr.validated) quality=quality+icr.fields.length;
      this.icrs[i].quality=quality;
    }
/*
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
        if (icr.value==undefined || icr.value==null) {
          console.log(icr);
          continue;
        }
        if (icr.value.includes('\r')) {
          icr.value=icr.value.split('\r').join('');
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
          if (icr.tags[i].includes('\r')) {
            icr.tags[i]=icr.tags[i].split('\r').join('');
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
        /*if (!icr.validated) {
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
    }*/
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
        comparison=-
        1;
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

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }
}
