import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TimerInterface} from "../../interfaces/timer.interface";
import {EsercizioInterface} from "../../interfaces/esercizio.interface";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {FirestoreService} from "../../shared/firestore.service";

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent {
  form!: FormGroup;
  timerInterval: any;
  totalInterval : number = 0;
  circumference: number = 2 * Math.PI * 45;
  remainingTime: number = 0;
  currentType!: string;
  currentDataIndex: number = 0;
  paused : boolean = true;
  documentID!: string;
  dati : TimerInterface[] = [];

  defaultExercise : EsercizioInterface ={
    nomeEsercizio: "Default",
    numSerieAllenanti: 1,
    numSerieRiscaldamento: 0,
    prepareTime: 30,
    workTime: 60,
    restAllenamento: 90,
    schedaID: "offline_timer"
  }

  constructor(private formBuilder: FormBuilder,
              private route : ActivatedRoute,
              private firestore : FirestoreService
  ) {
    this.form = this.formBuilder.group({
      remainingTime: [0],
      currentType: ['']
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const documentID = params.get('id');
      if (documentID !== null) {
        this.documentID = documentID;
        this.firestore.getEsercizio(this.documentID).then((esercizio: EsercizioInterface | null) => {
          if (esercizio) {
            this.dati = this.convertEsercizioToTimer(esercizio);
            if (this.dati.length > 0) {
              this.resetTimer();
            }
          } else {
            console.log('Esercizio non trovato o è null.');
          }
        });
      } else {
        //Inizializzo il timer con valori di default
        this.dati = this.convertEsercizioToTimer(this.defaultExercise);
        if (this.dati.length > 0) {
          this.resetTimer();
        }
      }
    });
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
        }
      });
    }
  }

  convertEsercizioToTimer(esercizio : EsercizioInterface) : TimerInterface[]{
    const tempi: TimerInterface[] = [];
    //prepare
    let tmp : TimerInterface = {tipo:"Prepare" , time: esercizio.prepareTime};
    tempi.push(tmp);
    //riscaldamento
    for(let i=0; i< esercizio.numSerieRiscaldamento; i++){
      tmp = {tipo:"Riscaldamento - Work" , time: esercizio.workTime};
      tempi.push(tmp);
      tmp = {tipo:"Riscaldamento - Rest" , time: esercizio.restAllenamento};
      tempi.push(tmp);
    }
    //work
    for(let i=0; i< esercizio.numSerieAllenanti-1; i++){
      tmp = {tipo:"Allenamento - Work" , time: esercizio.workTime};
      tempi.push(tmp);
      tmp = {tipo:"Allenamento - Rest" , time: esercizio.restAllenamento};
      tempi.push(tmp);
    }
    if(esercizio.numSerieAllenanti !== 0){
      //l'ultimo allenamento non ha recupero
      tmp = {tipo:"Allenamento - Work" , time: esercizio.workTime};
      tempi.push(tmp);
    }
    return tempi;
  }
  startTimer() {
    if (this.timerInterval) {
      // Se c'è già un intervallo attivo, non fare nulla
      return;
    }
    this.paused = false;
    this.remainingTime = this.form.get('remainingTime')!.value;
    this.totalInterval = this.remainingTime;
    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.form.get('remainingTime')!.setValue(this.remainingTime);
        this.animateTimer(); // Chiama animateTimer per aggiornare l'animazione del timer
      } else {
        this.skipForward();
      }
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null; // Resetta l'ID dell'intervallo
    this.paused = true;
  }

  skipForward() {
    if (this.dati.length === 0 || this.getCurrentDataIndex() === this.dati.length - 1) {
      return;
    }
    const nextIndex = this.getCurrentDataIndex() + 1;

    this.switchToDataAtIndex(nextIndex);
  }

  skipBackward() {
    if (this.dati.length === 0 || this.getCurrentDataIndex() === 0) {
      return;
    }

    this.currentDataIndex = (this.currentDataIndex - 1 + this.dati.length) % this.dati.length;
    this.switchToDataAtIndex(this.currentDataIndex);
  }

  private switchToDataAtIndex(index: number) {
    this.currentDataIndex = index;
    this.remainingTime = this.dati[index].time;
    this.totalInterval = this.remainingTime;
    this.currentType = this.dati[index].tipo;
    this.form.get('remainingTime')!.setValue(this.remainingTime);
    this.form.get('currentType')!.setValue(this.currentType);
    // Mostra una notifica con il tipo corrente
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationContent = `Tipo: ${this.dati[index].tipo}, Tempo: ${this.dati[index].time}`;
      const notification = new Notification(notificationContent, {
        icon: 'assets/icons/logo_pulito.ico'
      });
    }
  }
  private getCurrentDataIndex(): number {
    return this.currentDataIndex;
  }

  resetTimer() {
    this.pauseTimer();

    this.currentDataIndex = 0;
    this.remainingTime = this.dati[0].time;
    this.totalInterval = this.remainingTime;
    this.currentType = this.dati[0].tipo;
    this.form.get('remainingTime')!.setValue(this.remainingTime);
    this.form.get('currentType')!.setValue(this.currentType);
  }

  animateTimer() {
    const timerProgress = document.querySelector('.timer-progress') as HTMLElement;
    if (timerProgress) {
      const angle = (360 / this.totalInterval ) * this.remainingTime;
      const dashLength = (angle * this.circumference) / 360;
      const dashOffset = this.circumference - dashLength;
      timerProgress.style.strokeDashoffset = dashOffset.toString();
    }
  }
}
