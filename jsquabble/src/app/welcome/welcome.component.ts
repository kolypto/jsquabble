import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { PersistentState, PersistentStateService } from '../persistent-state.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  public welcomeForm = new FormGroup({
    playerName: new FormControl(''),
    googleApiKey: new FormControl(''),
    googleSpreadsheetId: new FormControl(''),
  });

  constructor(private router: Router, private route: ActivatedRoute, private game: GameService, private persist: PersistentStateService) { }

  submit(){
    const values = this.welcomeForm.value;

    // Configure the game
    this.game.configure(values.playerName, values.googleApiKey, values.googleSpreadsheetId);

    // Good?
    if (this.game.isConfigured){
      // Save
      this.persist.saveState(values);

      // Proceed to gameplay
      this.router.navigate(['answer', 0]);
    }
  }

  ngOnInit(): void {
    // Initial parameters may have come from the query parameters
    const state = this.queryParams;
    if (state.googleApiKey){
      this.welcomeForm.get('googleApiKey')?.setValue(state.googleApiKey);
    }
    if (state.googleSpreadsheetId){
      this.welcomeForm.get('googleSpreadsheetId')?.setValue(state.googleSpreadsheetId);
    }

    // Reflect changes back into the URL
    this.welcomeForm.valueChanges.subscribe(value => {
      this.queryParams = {
        googleApiKey: this.welcomeForm.get('googleApiKey')?.value,
        googleSpreadsheetId: this.welcomeForm.get('googleSpreadsheetId')?.value,
      };
    });
  }

  /** Get query parameters from the URL
   */
  get queryParams(): UrlState {
    return {
      googleApiKey: this.route.snapshot.queryParams['googleApiKey'],
      googleSpreadsheetId: this.route.snapshot.queryParams['googleSpreadsheetId'],
    } as UrlState;
  }

  /** Update query parameters in the URL
   */
  set queryParams(value: UrlState){
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: value,
    });
  }
}

interface UrlState {
  googleApiKey?: string;
  googleSpreadsheetId?: string;
}