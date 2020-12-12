import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnswerComponent } from './answer/answer.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'answer/:id', component: AnswerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
