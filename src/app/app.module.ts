import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { GameState } from './shared/state/game.state';
import { GameDialogComponent } from './components/dialog/game-dialog.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    NgxsModule.forRoot([GameState], {
      developmentMode: !environment.production
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [GameDialogComponent]
})
export class AppModule { }
