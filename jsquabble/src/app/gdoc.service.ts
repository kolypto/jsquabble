import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpResponse } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class GdocService {
  // API keys to access Google APIs
  public googleApiKey = '';

  // A spreadsheet
  public googleSpreadsheetId = '';

  constructor(private http: HttpClient) {
    this.appendSheetRows('users', [['a', 'b']]).subscribe(console.log);
  }

  public configure(googleApiKey: string, googleSpreadsheetId: string){
    this.googleApiKey = googleApiKey;
    this.googleSpreadsheetId = googleSpreadsheetId;
  }

  /** Is the service configured?
   */
  get isConfigured(): boolean {
    return Boolean(this.googleApiKey && this.googleSpreadsheetId);
  }

  // Google spreadsheet API url
  protected get spreadsheetUrl() {
    return `https://sheets.googleapis.com/v4/spreadsheets/${this.googleSpreadsheetId}`;
  };

  /** Append a row to a spreadsheet
   */
  appendSheetRows(sheet: string, rows: SheetData): Observable<HttpResponse<GoogleSheetValuesResponse>> {
    // URL: POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append
    return this.http.post<GoogleSheetValuesResponse>(
      this._googleSheetUrl(`/values/${sheet}`, 'append', {
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: 'true',
        valueInputOption: 'RAW',
        alt: 'json'
      }),
      {
        majorDimension: 'ROWS',
        values: rows,
      },
      { observe: "response" },
    );
  }

  /** Load all data from a sheet
 */
  loadSheetData(): Observable<HttpResponse<GoogleSheetValuesResponse>> {
    return this.http.get<GoogleSheetValuesResponse>(
      this._googleSheetUrl('/values/Q0'),
      { observe: 'response' }
    );
  }

  /** Build a URL to a Google Spreadsheet API
   * @param uri
   * @param action
   * @param params
   */
  _googleSheetUrl(uri: string, action?: string, params: { [key: string]: string } = {}) {
    // URL params
    let url_params = new URLSearchParams({
      key: this.googleApiKey,
      ...params
    });

    // URL string
    let url = this.spreadsheetUrl;
    if (uri) url += uri;
    if (action) url += `:${action}`;

    return url + '?' + url_params.toString();
  }
}


interface GoogleSheetValuesResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

type SheetData = Array<Array<string>>;
