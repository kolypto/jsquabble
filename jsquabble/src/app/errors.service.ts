import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(protected toastr: ToastrService) { }

  reportCustomError(title: string, message: string){
    this.toastr.error(message, title);
  }

  reportRequestError(message: string){
    this.reportCustomError('Request error', message);
  }
}
