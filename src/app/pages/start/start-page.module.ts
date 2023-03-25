import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { StartPageComponent } from './start-page.component';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule } from '@angular/forms';


const routes: Routes = [{ path: '', component: StartPageComponent }]

@NgModule({
  declarations: [ StartPageComponent ],
  imports: [
    CommonModule,
    LeafletModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FormsModule
  ],
  exports: [RouterModule]
})
export class StartPageModule { }
