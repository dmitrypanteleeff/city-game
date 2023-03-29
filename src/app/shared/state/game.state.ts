import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { OptionsModel } from '../types/options.interface';
import { ToggleLanguageAction } from './game.actions';
import { CityModel } from '../types/cities.interface';

export interface GameStateModel {
  items: CityModel[],
  options: OptionsModel
}

@State<GameStateModel>({
  name: 'game',
  defaults: {
    items: [],
    options: {
      currentLanguage: 'eng',
      score: 0,
      languages: ['eng', 'rus']
    }
  }
})

@Injectable()
export class GameState {

  @Action(ToggleLanguageAction)
  ToggleLanguage(ctx: StateContext<GameStateModel>, action: ToggleLanguageAction) {
    const { name } = action;
    if (!name) { return; }

    const state = ctx.getState()

    ctx.setState({
      ...state,
      options: {
        ...state.options,
        currentLanguage: name
      }
    })
  }

}
