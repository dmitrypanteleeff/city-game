import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { StartPageComponent } from './start-page.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: StartPageComponent }]

@NgModule({
  declarations: [ StartPageComponent ],
  imports: [
    CommonModule,
    LeafletModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class StartPageModule { }
