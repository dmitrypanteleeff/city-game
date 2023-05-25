import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ResetGameAction } from 'src/app/shared/state/game.actions';

@Component({
  selector: 'app-game-dialog',
  templateUrl: './game-dialog.component.html',
  styleUrls: ['./game-dialog.component.scss']
})
export class GameDialogComponent implements OnInit {

  title?: string;
  description: string;
  constructor(
    private _dialogRef: MatDialogRef<GameDialogComponent>,
    private _router: Router,
    @Inject(MAT_DIALOG_DATA) data: any,
    private _store: Store
  ) {
    this.title = data?.title;
    this.description = data.description;
  }

  ngOnInit() {
    console.log(this.title)
  }

  close() {
    this._dialogRef.close();
    //this._store.dispatch(new ResetGameAction('dasd'));
    // this._router.navigate(['/start']);
  }


}
