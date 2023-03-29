import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { MAIN_PAGE_ENG, MAIN_PAGE_RUS } from './main-page.config'
import { ToggleLanguageAction } from 'src/app/shared/state/game.actions';
import { GameStateModel } from 'src/app/shared/state/game.state';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  initialSnapshot: GameStateModel;
  currentLanguage!: string;
  languages!: string[];

  pageLanguage = MAIN_PAGE_ENG;

  constructor( private _store: Store ) {
    this.initialSnapshot = _store.snapshot().game;
    this.currentLanguage = this.initialSnapshot.options.currentLanguage;
    this.languages = this.initialSnapshot.options.languages;

    this.currentLanguage === 'eng' ? this.pageLanguage = MAIN_PAGE_ENG : this.pageLanguage = MAIN_PAGE_RUS;
  }

  toggleLanguage() {
    console.log('click')


    const changeLanguage = this.languages.filter(item => item !== this.currentLanguage);
    console.log('язык на который поменять', changeLanguage[0]);

    this._store.dispatch(new ToggleLanguageAction(changeLanguage[0]));
    this.initialSnapshot = this._store.snapshot().game;
    console.log(this.initialSnapshot);
    this.currentLanguage = this.initialSnapshot.options.currentLanguage;

    this.currentLanguage === 'eng' ? this.pageLanguage = MAIN_PAGE_ENG : this.pageLanguage = MAIN_PAGE_RUS;
  }

  ngOnInit() {
    //console.log(this.initialSnapshot);
  }
}
