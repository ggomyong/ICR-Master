export class Icr {
  id: number;
  name: string;
  custodialPackage: string;
  subscribingPackage: string;
  usage: string;
  entered: string;
  status: string;
  expires: string;
  duration: string;
  version: string;
  type: string;
  value: string;
  file: string;
  validated: boolean;
  description: Array<string>;
  tags: Array<string>;
  fields: Array<Field>;
  fieldIndex: Array<string>;
  public constructor() {
    this.id=0;
    this.name='';
    this.custodialPackage='';
    this.subscribingPackage='';
    this.usage='';
    this.entered='';
    this.status='';
    this.expires='';
    this.duration='';
    this.version='';
    this.type='';
    this.value='';
    this.file='';
    this.validated=false;
    this.description=[];
    this.tags=[];
    this.fields=[];
    this.fieldIndex=[];
  }
}

export class Field {
  file: number;
  value: string;
  direction: string;
  method: string;
  public constructor() {
    this.file=-1
    this.value='';
    this.direction='';
    this.method='';
  }
}
