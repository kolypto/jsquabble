import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GdocService } from './gdoc.service';
import { PersistentStateService } from './persistent-state.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  /** The name of the current player
   */
  public playerName?: string;

  /** Current question's id
   */
  public currentQuestion: number = 0;

  constructor(protected gdoc: GdocService, persist: PersistentStateService) {
    const state = persist.loadState();
    if (state){
      this.configure(state.playerName, state.googleApiKey, state.googleSpreadsheetId);
    }
  }

  /** Configure the game
   * @param playerName Name of the current player
   * @param googleApiKey API key for Google Spreadsheet API
   * @param googleSpreadsheetId Game spreadsheet
   */
  public configure(playerName: string, googleApiKey: string, googleSpreadsheetId: string){
    this.playerName = playerName;
    this.gdoc.configure(googleApiKey, googleSpreadsheetId);
  }

  /** Is the game configured and ready to go?
   */
  get isConfigured(): boolean {
    return Boolean(this.playerName && this.gdoc.isConfigured);
  }

  /** Go to a specific question
   */
  public jumpToQuestion(id: number){
    this.currentQuestion = id;
  }

  /** Submit an answer to the current question
   */
  public submitAnswer(answer: string): Observable<boolean>{
    return this.gdoc.appendSheetRows(
      `Q${this.currentQuestion}`,
      [
        [this.playerName!, answer],
      ]
    ).pipe(
      map(res => true)
    );
  }
}
