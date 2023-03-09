export class Icr {
  id: number;
  name: string;
  custodialPackage: string;
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
  fields: Array<Field>;
  globalReferences: Array<GlobalReference>
  fieldIndex: Array<string>;
  quality: number;
  custodialIsc?: string;
  dbicStatus?: string;
  tags?: Tag[];
  subscribingPackages: SubscribingPackage[];
  keywords?: string[]
  dateCreated: string
  remoteProcedure: string
  dateActivated: string;
  public constructor() {
    this.id=0;
    this.name='';
    this.custodialPackage='';
    this.subscribingPackages=[];
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
    this.globalReferences = [];
    this.custodialIsc = '';
    this.dbicStatus = '';
    this.keywords = [];
    this.dateCreated = '';
    this.remoteProcedure = '';
    this.dateActivated = '';
  }
}

export class Tag {
  name: string;
  description: string[];
  variables: Variable[]
  constructor() {
    this.name = '';
    this.description = [];
    this.variables= [];
  }
}

export class Variable {
  name: string;
  type: string;
  description: string[];
  constructor() {
    this.name = '';
    this.type='';
    this.description = [];
    
  }
}

export class Field {
  file: number;
  name?: string;
  value: string;
  reference?: string;
  location?: string;
  direction: string;
  method: string;
  description: string[];
  public constructor() {
    this.file=-1
    this.name = '';
    this.value='';
    this.direction='';
    this.method='';
    this.reference = '';
    this.location = '';
    this.description = [];
  }
}

export class GlobalReference {
  reference: string;
  description: string[];
  fields?: Field[];
  public constructor() {
    this.reference = '';
    this.description = [];
    this.fields = [];
  }
}

export class SubscribingPackage{
  name: string;
  isc: string;
  details: string[];
  
  public constructor() {
    this.name = '';
    this.isc = '';
    this.details = [];
  }
}
