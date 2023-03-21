import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsPageComponent } from './options-page.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: OptionsPageComponent }]

@NgModule({
  declarations: [OptionsPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class OptionsPageModule { }
