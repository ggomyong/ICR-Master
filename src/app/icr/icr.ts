export class Icr {
  id: number;
  name: string;
  type: string;
  value: string;
  file: string;
  validated: boolean;
  description: Array<string>;
  tags: Array<string>;
  fields: Array<Field>;
  fieldIndex: Array<string>;
}

export class Field {
  file: number;
  value: string;
  direction: string;
  method: string;
}
