import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MenuPageComponent } from './pages/menu/menu-page.component';
import { StartPageComponent } from './pages/start/start-page.component';
import { OptionsPageComponent } from './pages/options/options-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    MenuPageComponent,
    StartPageComponent,
    OptionsPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule,
    RouterModule.forChild([
      {
        path: '',
        redirectTo: '/main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: MenuPageComponent
      },
      {
        path: 'start',
        component: StartPageComponent
      },
      {
        path: 'options',
        component: OptionsPageComponent
      },
    ]),
    BrowserAnimationsModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
