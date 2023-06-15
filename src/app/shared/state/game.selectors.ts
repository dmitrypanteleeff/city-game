import { Selector } from '@ngxs/store';
import { GameState, GameStateModel } from './game.state';
import { CityModel } from '../types/cities.interface';


export class GameSelectors {
  @Selector([GameState])
  static currentLanguage(state: GameStateModel): string {
    return state.options.currentLanguage;
  }

  @Selector([GameState])
  static score(state: GameStateModel): number {
    return state.options.score;
  }

  @Selector([GameState])
  static cities(state: GameStateModel): CityModel[] {
    return state.items;
  }
}
