export class ToggleLanguageAction {
  static readonly type = '[MAIN page] Toggle language';
  constructor(public name: string) { }
}

export class ResetGameAction {
  static readonly type = '[MAIN page] Reset game';
  constructor(public name: string) { }
}
