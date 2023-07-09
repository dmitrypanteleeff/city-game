import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityInputComponent } from './city-input.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CityInputComponent],
  exports: [CityInputComponent],
  imports: [CommonModule, FormsModule],
})
export class CityInputModule {}
