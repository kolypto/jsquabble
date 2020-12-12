import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(public game: GameService) {
  }

  ngOnInit(): void {
  }

}
