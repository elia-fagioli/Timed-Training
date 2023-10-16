import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-edit_tablerow',
  templateUrl: './edit_tablerow.component.html',
  styleUrls: ['./edit_tablerow.component.css']
})

export class Edit_tablerowComponent {
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
  @Input() public rowData: any = {
    giorno: '',
    descrizione: ''
  };
  @Output() saveEvent = new EventEmitter<any>();

  // Array dei giorni disponibili
  daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  // Array dei giorni selezionati
  selectedDays: string[] = [];

  saveChanges() {
    // Emetti l'evento con i dati aggiornati
    this.saveEvent.emit(this.rowData);
    this.clearData();
  }

  closePopup() {
    // Emetti l'evento personalizzato
    this.closeEvent.emit();
    this.clearData();
  }

  clearData() {
    // Resetta dati
    this.rowData.giorno = '';
    this.rowData.descrizione = '';

    // Ripristina i giorni disponibili
    this.daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

    // Ripristina l'array dei giorni selezionati
    this.selectedDays = [];
  }
}
