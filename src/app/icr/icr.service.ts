import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {Icr} from './icr';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

export class IcrMaster{
  id:string;
  members:Array<string>;
}

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

  public getIcr(id:string) {
    return this.http.get <Icr>('/api/getIcr?id='+id)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  public downloadIcrs() {
    return this.http.get <Icr[]>('/api/download')
      .pipe(
        tap((data)=>{
          console.log(data);
        }),
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  public uploadIcr(icr:Icr) {
    return this.http.post('/api/upload', icr).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError) // then handle the error
    ) .subscribe((response)=>{
      console.log(response);
    });
  }

  public uploadBulkIcrs(icrMaster:IcrMaster, icrs:Array<Icr>) {
    this.http.post('/api/upload', icrMaster).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError) // then handle the error
    ) .pipe(
      tap((node)=>{
        console.log(node);
      })
    ).subscribe((response)=>{
      console.log(response);
    });

    this.http.post('/api/bulkUpload', icrs).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError) // then handle the error
    ) .subscribe((response)=>{
      console.log(response);
    });
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
