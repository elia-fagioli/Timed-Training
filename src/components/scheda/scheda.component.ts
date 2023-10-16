import {ChangeDetectorRef, Component} from '@angular/core';
import {FirestoreService} from "../../shared/firestore.service";
import {EsercizioInterface} from "../../interfaces/esercizio.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
@Component({
  selector: 'app-scheda',
  templateUrl: './scheda.component.html',
  styleUrls: ['./scheda.component.css']
})
export class SchedaComponent {
  form: FormGroup;
  tableData: FormArray;
  originalFormValues: any[] = [];

  schedaId!: string;
  editingRowIndex: number = -1;
  constructor(private firestore: FirestoreService,
              private changeDetectorRef: ChangeDetectorRef,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private router: Router) {
    this.form = this.fb.group({
      tableData: this.fb.array([]),
    });
    this.tableData = this.form.get('tableData') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      //Aggiungendo ! dopo params['id'], stai dicendo a TypeScript che il valore non sarà mai null o undefined.
      this.schedaId = params.get('id')!;
      // Utilizza l'ID della scheda per caricare i dati necessari per visualizzare la scheda
    });
    this.populateTableData().then();
  }
  async populateTableData() {
    const schede = await this.firestore.getEserciziScheda(this.schedaId!);
    if (schede.length > 0) {
      this.populateRowsFormArray(schede);
    }
    this.changeDetectorRef.detectChanges();
  }
  populateRowsFormArray(data : EsercizioInterface[]): void {
    this.tableData.clear(); // Rimuove tutte le righe esistenti
    data.forEach(row => {
      const rowFormGroup = this.fb.group({
        documentID: [row.documentID],
        nomeEsercizio: [row.nomeEsercizio],
        prepareTime: [row.prepareTime],
        workTime: [row.workTime],
        restAllenamento: [row.restAllenamento],
        numSerieRiscaldamento: [row.numSerieRiscaldamento],
        numSerieAllenanti: [row.numSerieAllenanti],
      });
      // Monitoriamo i cambiamenti per ogni campo dell'oggetto FormGroup
      rowFormGroup.valueChanges.subscribe(() => {
        this.isRowDirty(this.tableData.length - 1);
      });
      this.tableData.push(rowFormGroup);
    });
  }
  addRowToTable() {
    if (this.tableData.length >= 7) {
      //Limite non obbligatorio, in futuro si potrà modificare in base agli utilizzi
      // Il numero massimo di righe è stato raggiunto, esegui le azioni desiderate
      console.log("Numero massimo di schede raggiunto (7)");
      return;
    } else {
      this.firestore.nuovoEsercizio(this.schedaId!);
    }
    this.populateTableData().then();
  }
  deleteRow(index: number): void {
    //Elimina riga
    this.firestore.deleteEsercizio(this.tableData.at(index).value.documentID!);
    this.populateTableData().then();
  }
  enableEditing(index: number) {
    if (this.editingRowIndex !== index) {
      // Se c'è una riga selezionata e l'utente passa a un'altra riga senza salvare le modifiche,
      // ripristina l'intero form con i valori originali della riga selezionata
      const currentRow = this.tableData.at(this.editingRowIndex);
      currentRow.patchValue({ ...this.originalFormValues[this.editingRowIndex] });
    }
    this.editingRowIndex = index;
    // Salva una copia dei valori del form della riga corrente
    this.originalFormValues[index] = { ...this.tableData.at(index).value };
  }
  saveEditing(index: number) {
    const updatedData: Partial<EsercizioInterface> = {
      nomeEsercizio: this.tableData.at(index).value.nomeEsercizio,

      prepareTime: this.tableData.at(index).value.prepareTime,
      workTime: this.tableData.at(index).value.workTime,
      restAllenamento: this.tableData.at(index).value.restAllenamento,

      numSerieRiscaldamento: this.tableData.at(index).value.numSerieRiscaldamento,
      numSerieAllenanti: this.tableData.at(index).value.numSerieAllenanti,
    };
    this.firestore.updateEsercizio(this.tableData.at(index).value.documentID!, updatedData);
    this.editingRowIndex = -1;
    this.populateTableData().then();
  }

  isRowDirty(index: number): boolean {
    const row = this.tableData.at(index);
    return row.dirty; // Verifichiamo se il form della riga è stato modificato
  }

  openTimer(index : number){
    const id = this.tableData.at(index).value.documentID!;
    this.router.navigate(['/timer', id]).then();
  }
}
