import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { PersistentStateService } from '../persistent-state.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  public welcomeForm = new FormGroup({
    playerName: new FormControl(''),
    backendUrl: new FormControl(''),
  });

  constructor(private router: Router, private route: ActivatedRoute, private game: GameService, private persist: PersistentStateService) { }

  submit(){
    const values = this.welcomeForm.value;

    // Configure the game
    this.game.configure(values.playerName, values.backendUrl);

    // Good?
    if (this.game.isConfigured){
      // Save
      this.persist.saveState(values);

      // Proceed to gameplay
      this.router.navigate(['answer', 0]);
    }
  }

  ngOnInit(): void {
    // Clear localStorage
    this.persist.clear();

    // Initial parameters may have come from the query parameters
    const state = this.queryParams;
    if (state.backendUrl){
      this.welcomeForm.get('backendUrl')?.setValue(state.backendUrl);
    }

    // Reflect changes back into the URL
    this.welcomeForm.valueChanges.subscribe(value => {
      this.queryParams = {
        backendUrl: this.welcomeForm.get('backendUrl')?.value,
      };
    });
  }

  /** Get query parameters from the URL
   */
  get queryParams(): UrlState {
    return {
      backendUrl: this.route.snapshot.queryParams['backendUrl'],
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
  backendUrl?: string;
}