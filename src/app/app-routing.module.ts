import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: () => import('src/app/pages/main/main-page.module').then(m => m.MenuPageModule)
      },
      {
        path: 'start',
        loadChildren: () => import('src/app/pages/start/start-page.module').then(m => m.StartPageModule)
      },
      {
        path: 'options',
        loadChildren: () => import('src/app/pages/options/options-page.module').then(m => m.OptionsPageModule)
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
