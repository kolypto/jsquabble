import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class PersistentStateService {

  constructor(@Inject(SESSION_STORAGE) protected storage: StorageService) {}

  /** Save game state
   */
  public saveState(state: PersistentState){
    this.storage.set('state', state);
  }

  /** Load game state
   */
  public loadState(): PersistentState|undefined {
    return this.storage.get('state') as PersistentState|undefined;
  }
}

export interface PersistentState {
  playerName: string;
  googleApiKey: string;
  googleSpreadsheetId: string;
}