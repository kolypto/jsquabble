import { Injectable } from '@angular/core';
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { Apollo, gql } from 'apollo-angular';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PersistentStateService } from './persistent-state.service';
import { debug } from 'console';

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

  constructor(persist: PersistentStateService, private apollo: Apollo, protected httpLink: HttpLink) {
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

    // Re-create the Apollo client
    this.apollo.removeClient();
    this.apollo.create({
      cache: new InMemoryCache(),
      link: this.httpLink.create({
        uri: this.backendUrl,
      })
    });
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
    return this.apollo.mutate({
      mutation: SUBMIT_ANSWER,
      variables: {
        question: this.currentQuestion,
        name: this.playerName,
        answer: answer,
      }
    }).pipe(
      map(res => true),
    );
  }
}


const SUBMIT_ANSWER = gql`
  mutation submitAnswer($question: Int! $name: String! $answer: String!) {
    submitAnswer(question: $question name: $name answer: $answer)
  }
`;