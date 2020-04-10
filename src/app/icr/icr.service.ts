import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {Icr} from './icr';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class IcrService {
  icrUrl = '../../assets/Export_ICR.csv';

  constructor(private http: HttpClient) { }

  public getIcrs() {
    return this.http.get(this.icrUrl, {responseType: 'text'})
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  public parseIcr(texts:Array<string>) {
    //Try to parse the raw ICRs into meaning JSON objects.
    let icr:Icr=new Icr();
    let icrs:Array<Icr>=[];

    for (let text of texts) {
      let array=this.breakAndCombine(text);
      let descriptionFlag=false;

      if (text.includes('NAME: ')) {
        if (icr.id>0) {
          icrs.push(icr); //push already created one, and then begin again.
        }
        icr=new Icr(); //and then, start a new ICR instance
        icr.id=Number(array[0]);
        array.splice(0,2)
        icr.name=array.join(' ');
      }
      else if (text.includes('CUSTODIAL PACKAGE: ')) {
        array.splice(0,2)
        icr.custodialPackage=array.join(' ');
      }
      else if (text.includes('SUBSCRIBING PACKAGE: ')) {
        array.splice(0,2)
        icr.subscribingPackage=array.join(' ');
      }
      else if (text.includes('USAGE: ')) {
        icr.usage=array[1];
        array.splice(0,3)
        icr.entered=array.join(' ');
      }
      else if (text.includes('STATUS: ')) {
        icr.status=array[1];
        array.splice(0,3);
        icr.expires=array.join(' ');
      }
      else if (text.includes('DURATION: ')) {
        icr.duration=this.breakAndCombine(text.split('DURATION: ')[1].split("VERSION:")[0]).join(' ');
        icr.version=text.split('VERSION: ')[1];
      }
      else if (text.includes('FILE: ')) {
        icr.file=array[1];
        icr.value=array[3];
      }
      else if (text.includes('DESCRIPTION: ')) {
        descriptionFlag=true;

        switch(array[3]) {
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
      else if (text.includes('ROUTINE: ')) {
        descriptionFlag=false;
      }
      else if (text.includes('COMPONENT: ')) {
        icr.tags.push(array[1]);
      }
      else if (descriptionFlag) {
        icr.description.push(array.join(' '));
      }
    }

    console.log(icrs);
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

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  makeIntentionalError() {
    return this.http.get('not/a/real/url')
      .pipe(
        catchError(this.handleError)
      );
  }



}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
