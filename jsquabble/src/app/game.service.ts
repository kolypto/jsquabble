import { Injectable } from '@angular/core';
import { InMemoryCache } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { Apollo, gql } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Answer } from './answer';
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

  constructor(persist: PersistentStateService, private apollo: Apollo, private httpLink: HttpLink) {
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
    const httpUri = this.backendUrl;
    const websocketUri = this.backendUrl.replace('http', 'ws');

    // Create: HTTP
    this.apollo.removeClient();
    this.apollo.create({
      cache: new InMemoryCache(),
      link: this.httpLink.create({
        uri: httpUri,
      }),
    });

    // Create: websocket
    this.apollo.removeClient('ws');
    this.apollo.create({
      cache: new InMemoryCache(),
      link: new WebSocketLink({
        // Install: $ npm install apollo-link-ws subscriptions-transport-ws --save
        uri: websocketUri,  // starts with: "ws://" or "wss://"
        // options: { reconnect: true }
      }),
    }, 'ws');
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

  /** Listen to new answers (admin feature)
   */
  public subscribeNewAnswers(lookback: boolean): Observable<Answer>{
    if (!this.isConfigured){
      return throwError(new Error('Client not configured. Have you been to the welcome page?'));
    }

    return this.apollo.use('ws').subscribe({
      query: SUBSCRIBE_ANSWERS,
      variables: { lookback },

    }).pipe(
      map(res => (res as {data: {answer: Answer}}).data.answer)
    ) as Observable<Answer>;
  }

  /** Update the score of an answer
   */
  public updateScore(answer: Answer): Observable<boolean> {
    return this.apollo.mutate({
      mutation: UPDATE_SCORE,
      variables: {
        question: answer.question,
        name: answer.name,
        score: answer.score,
      }
    }).pipe(
      map(res => true),
    );
  }

  /** Reset all answers on the server
   */
  public clearAnswers(): Observable<boolean> {
    return this.apollo.mutate({
      mutation: CLEAR_ANSWERS,
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

const UPDATE_SCORE = gql`
  mutation ($name: String!, $question: Int!, $score: Int!) {
    answerScore(name:$name question:$question score:$score)
  }
`;

const CLEAR_ANSWERS = gql`
  mutation {
    clearAnswers
  }
`;

const SUBSCRIBE_ANSWERS = gql`
  subscription ($lookback: Boolean!) {
    answer (lookback: $lookback) {
      question
      name
      answer
      score
    }
  }
`;
