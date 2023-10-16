import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {EsercizioInterface} from "../../interfaces/esercizio.interface";
import {TimerComponent} from "../timer/timer.component";
@Component({
  selector: 'app-offline_timer',
  templateUrl: './offline_timer.component.html',
  styleUrls: ['./offline_timer.component.css']
})

export class Offline_timerComponent{
  form: FormGroup;

  @ViewChild(TimerComponent) timerComponent!: TimerComponent;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      //valori di default per utilizzo offline
      prepareTime: [30],
      workTime: [60],
      restAllenamento: [90],
      numSerieAllenanti: [1],
      numSerieRiscaldamento: [0]
    });
  }

  updateTimer(){
    const esercizio: EsercizioInterface = {
      nomeEsercizio: "offline_timer",
      schedaID: "offline_timer",
      prepareTime: this.form.get('prepareTime')!.value,
      workTime: this.form.get('workTime')!.value,
      restAllenamento: this.form.get('restAllenamento')!.value,
      numSerieRiscaldamento: this.form.get('numSerieRiscaldamento')!.value,
      numSerieAllenanti: this.form.get('numSerieAllenanti')!.value
    };
    this.timerComponent.dati = this.timerComponent.convertEsercizioToTimer(esercizio);
    this.timerComponent.resetTimer();
  }
}
