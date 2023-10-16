import {ChangeDetectorRef, Component} from '@angular/core';
import {FirestoreService} from "../../shared/firestore.service";
import {SchedaInterface} from "../../interfaces/scheda.interface";
import {Router} from "@angular/router";
@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.css']
})

export class ArchivioComponent {
  //vars per form di editing di schede
  isEditOpen = false;
  isOverlayBlur: boolean = false;
  //vars per indicizzazione righe tabella
  selectedRow: any = {};
  rowIndex: number = -1;
  //Array schede da firestore
  tableData: SchedaInterface[] = [];
  constructor(private firestore: FirestoreService,
              private changeDetectorRef: ChangeDetectorRef,
              private router: Router) {}
  ngOnInit() {
    //caricamento iniziale
    this.populateTableData().then();
  }
  async populateTableData() {
    //popola tableData
    this.tableData = await this.firestore.getSchedeUtente();
    this.changeDetectorRef.detectChanges();
  }
  addRowToTable() {
    if (this.tableData.length >= 7) {
      //Massimo numero di giorni per archivio schede
      return;
    } else {
      //crea una nuova scheda nel database
      this.firestore.nuovaScheda();
    }
    this.populateTableData().then();
  }
  deleteRow(index: number): void {
    //cancella dal database una scheda
    this.firestore.deleteScheda(this.tableData[index].documentID).then();
    this.populateTableData().then();
  }
  openEdit(index: number) {
    //apre edit_tablerow component
    this.isEditOpen = true;
    this.isOverlayBlur = true;
    this.rowIndex = index;
  }
  handleSaveEvent(updatedRowData: any) {
    //save event di edit_tablerow
    if (this.rowIndex !== undefined && this.rowIndex >= 0 && this.rowIndex < this.tableData.length) {
      const rowData = this.tableData[this.rowIndex];
      if (rowData && rowData.documentID) {
        const giorno = updatedRowData.giorno || ''; // Valore di fallback nel caso in cui updatedRowData.giorno sia undefined
        const descrizione = updatedRowData.descrizione || ''; // Valore di fallback nel caso in cui updatedRowData.descrizione sia undefined

        this.firestore.updateScheda(
          rowData.documentID,
          giorno,
          descrizione
        );
        this.populateTableData().then();
      }
      // Chiudi il popup di modifica
      this.isEditOpen = false;
      this.rowIndex = -1; // Reset rowIndex
      this.isOverlayBlur = false;
    }
  }
  handleCloseEvent() {
    // Codice da eseguire quando viene ricevuto l'evento closeEvent dal componente figlio
    this.isEditOpen = false;
    this.isOverlayBlur = false;
    this.rowIndex = -1; // Reset rowIndex
  }

  // Funzione chiamata quando l'utente fa clic su un bottone elenco della scheda
  goToScheda(id: string | undefined) {
    this.router.navigate(['/scheda', id]).then();
  }
}
