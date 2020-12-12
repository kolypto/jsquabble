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
    this.game.subscribeNewAnswers(true).subscribe({
      next: res => {
        this.answers.push(res);
      },
      error: err => this.error.reportRequestError(err),
    });
  }

}
