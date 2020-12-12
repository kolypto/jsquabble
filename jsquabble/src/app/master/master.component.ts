import { Component, OnInit } from '@angular/core';
import { Answer } from '../answer';
import { ErrorsService } from '../errors.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {

  constructor(protected game: GameService, protected error: ErrorsService) { }

  public answers: Array<Answer> = [];

  ngOnInit(): void {
    // Subscribe to new answers
    this.game.subscribeNewAnswers(true).subscribe({
      next: res => {
        this.answers.push(res);
      },
      error: err => this.error.reportRequestError(err),
    });
  }

  /** Set a score for one of the answers
   */
  public changeScore(answer: Answer, newScore?: number){
    answer.score = newScore ? +newScore : undefined;
    this.game.updateScore(answer).subscribe({
      error: err => this.error.reportRequestError(err),
    });
  }

  /** Remove all answers
   */
  public clearAnswers(){
    this.game.clearAnswers().subscribe({
      next: res => this.answers.length = 0,
      error: err => this.error.reportRequestError(err),
    });
  }
}
