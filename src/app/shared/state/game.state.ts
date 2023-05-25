import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { OptionsModel } from '../types/options.interface';
import { ResetGameAction, ToggleLanguageAction } from './game.actions';
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
      currentLanguage: 'rus',
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

  @Action(ResetGameAction)
  ResetGameAction(ctx: StateContext<GameStateModel>, action: ResetGameAction) {
    const { name } = action;
    if (!name) { return; }

    const state = ctx.getState();

    console.log(222222, name)

    ctx.setState({
      ...state,
      options: {
        ...state.options,
        score: 0
      }
    })

    console.log(state.options)
  }

}
