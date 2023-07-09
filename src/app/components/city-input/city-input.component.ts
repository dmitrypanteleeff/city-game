import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { START_PAGE_ENG, START_PAGE_RUS } from 'src/app/pages/start/start-page.config';
import { patternEng, patternRus } from 'src/app/shared/config/game.config';
import { GameSelectors } from 'src/app/shared/state/game.selectors';

@Component({
  selector: 'app-city-input',
  templateUrl: './city-input.component.html',
  styleUrls: ['./city-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CityInputComponent implements OnInit {
  @Input() classInputWrapper: string = '';
  @Input() type: 'text' | 'password' = 'text';
  @Input() classInputValue: string = '';
  @Input() name!: string;
  @Input() value: string = '';
  @Input() classInputPlaceHolder: string  = '';
  @Input() placeholder!: string;
  @Output() inputValueChange = new EventEmitter<string>();
  @ViewChild('inputElem') inputElem!: ElementRef;

  @Select(GameSelectors.currentLanguage) currentLanguagee$!: Observable<string>;

  city!: string;
  readonly patternEng: RegExp = patternEng;
  readonly patternRus: RegExp = patternRus;



  curPattern: RegExp = this.patternRus;

  currentLanguage!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  pageLanguage = START_PAGE_ENG;

  flag: boolean = false

  inputValue() {

    this.flag = this.curPattern.test(this.value);
    this.value = this.value.replace(this.curPattern, '');
    this.inputElem.nativeElement.value = this.inputElem.nativeElement.value.replace(this.curPattern, '');
    this.inputValueChange.emit(this.inputElem.nativeElement.value);
  }

  ngOnInit(): void {

    this.currentLanguagee$
      .pipe(
        takeUntil(this.destroy$))
      .subscribe(val => this.currentLanguage = val);

    this.currentLanguage === 'eng' ? this.pageLanguage = START_PAGE_ENG : this.pageLanguage = START_PAGE_RUS;
    this.currentLanguage === 'eng' ? this.curPattern = this.patternEng : this.curPattern = this.patternRus;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
