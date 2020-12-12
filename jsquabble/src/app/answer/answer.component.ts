import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ErrorsService } from '../errors.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit {
  public answerForm = new FormGroup({
    answer: new FormControl(''),
  });

  /** What was the answer you've just
   */
  public submittedAnswer?: string;

  constructor(public game: GameService, protected route: ActivatedRoute, protected error: ErrorsService) { }

  submit(){
    const values = this.answerForm.value;
    if (values.answer){
      this.game.submitAnswer(values.answer).subscribe({
        next: res => {
          this.submittedAnswer = values.answer;
        },
        error: err => {
          this.error.reportRequestError('Failed to submit your answers');
          throw err;
        }
      });
    }
  }

  ngOnInit(): void {
    // Listen to URL changes, jump to a question
    this.route.params.subscribe(queryParams => {
      this.game.jumpToQuestion(+queryParams.id);
    });
  }

}
