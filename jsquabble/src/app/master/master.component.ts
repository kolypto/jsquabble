import { Component, OnInit } from '@angular/core';
import { ErrorsService } from '../errors.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {

  constructor(protected game: GameService, protected error: ErrorsService) { }

  ngOnInit(): void {
  }

}
