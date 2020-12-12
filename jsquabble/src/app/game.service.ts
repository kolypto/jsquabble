import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { PersistentStateService } from './persistent-state.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  /** The name of the current player
   */
  public playerName?: string;

  /** API URL
   */
  public backendUrl?: string;

  /** Current question's id
   */
  public currentQuestion: number = 0;

  constructor(persist: PersistentStateService) {
    const state = persist.loadState();
    if (state){
      this.configure(state.playerName, state.backendUrl);
    }
  }

  /** Configure the game
   * @param playerName Name of the current player
   * @param googleApiKey API key for Google Spreadsheet API
   * @param googleSpreadsheetId Game spreadsheet
   */
  public configure(playerName: string, backendUrl: string){
    this.playerName = playerName;
    this.backendUrl = backendUrl;
  }

  /** Is the game configured and ready to go?
   */
  get isConfigured(): boolean {
    return Boolean(this.playerName && this.backendUrl);
  }

  /** Go to a specific question
   */
  public jumpToQuestion(id: number){
    this.currentQuestion = id;
  }

  /** Submit an answer to the current question
   */
  public submitAnswer(answer: string): Observable<boolean>{
    return of(true);
  }
}
