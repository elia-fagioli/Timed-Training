import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {getDocs} from "@angular/fire/firestore";
import {UserInterface} from "../interfaces/user.interface";
import {getAuth} from "@angular/fire/auth/";
import {SchedaInterface} from "../interfaces/scheda.interface";
import {EsercizioInterface} from "../interfaces/esercizio.interface";

@Injectable({
  providedIn: 'root',
})
export class FirestoreService{
  constructor(private firestore: AngularFirestore) {}
  async addDocument<T>(collectionPath: string, data: T): Promise<string> {
    const collectionRef = this.firestore.collection(collectionPath);
    const documentRef = await collectionRef.add(data);
    return documentRef.id;
  }
  queryFieldExistsInCollection(collectionPath: string, field: string, value: string){
    const collectionRef = this.firestore.collection(collectionPath);
    const q = collectionRef.ref.where(field, "==", value);
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          console.log('Nessun user trovato.');
          // Creazione dell'oggetto dell'utente da aggiungere alla collezione
          const newUser: UserInterface = {
            email: value
          };
          this.addDocument(collectionPath, newUser).then();
          return true;
        } else {
          return false;
        }
      })
      .catch((error:Error) => {
        console.error('Errore durante il recupero dei documenti');
      });
  }

  /*Metodi per Schede*/
  getGiornoNumerico(giorno: string): number {
    const giorniSettimana: Record<string, number> = {
      LUNEDÌ: 1,
      MARTEDÌ: 2,
      MERCOLEDÌ: 3,
      GIOVEDÌ: 4,
      VENERDÌ: 5,
      SABATO: 6,
      DOMENICA: 7,
    };

    const giornoNumerico = giorniSettimana[giorno.toUpperCase()];
    if (giornoNumerico !== undefined) {
      return giornoNumerico;
    } else {
      return 8; // valore speciale per rappresentare il giorno non valido
    }
  }

  async getSchedeUtente(): Promise<SchedaInterface[]> {
    const email = getAuth().currentUser?.email;
    const collectionRef = this.firestore.collection('schede');
    const q = collectionRef.ref.where('userEmail', '==', email);

    try {
      const querySnapshot = await getDocs(q);
      let schede: SchedaInterface[] = [];

      querySnapshot.forEach((doc) => {
        const data: any = doc.data();
        const giorno = data.giorno;

        const scheda: SchedaInterface = {
          documentID: doc.id,
          userEmail: data.userEmail,
          giorno: giorno,
          descrizione: data.descrizione,
        };
        schede.push(scheda);
      });

      schede.sort((a, b) => this.getGiornoNumerico(a.giorno as string) - this.getGiornoNumerico(b.giorno as string));
      return schede;
    } catch (error) {
      console.error('Errore durante il recupero dei documenti:', error);
      return [];
    }
  }
  nuovaScheda(){
    const userEmail = getAuth().currentUser?.email;
    if(userEmail) {
      const newScheda: SchedaInterface = {
        userEmail: userEmail,
        giorno: 'INSERISCI GIORNO',
        descrizione: 'Aggiungi una descrizione',
      };
      this.addDocument("schede",newScheda).then();
    }
  }
  async deleteScheda(documentId: string | undefined){
    try {
      const documentRef = this.firestore.collection('schede').doc(documentId).delete();
      //eliminazione esercizi di quella scheda da collection esercizi
      const snapshot = await this.firestore.collection('esercizi').ref.where('schedaID', '==', documentId).get();
      if (snapshot.empty) {
        console.log('Nessun esercizio collegato alla scheda.');
        return;
      }
      //elimina tutti gli esercizi della scheda
      snapshot.forEach(doc => {
        doc.ref.delete();
      });

    } catch (error){
      console.error("Error nell'operazione di eliminazione");
    }
  }

  updateScheda(documentId: string, updateGiorno: string | undefined, updateDescrizione: string | undefined) {
    const documentRef = this.firestore.collection('schede').doc(documentId);
    const updateData: any = {}; // Oggetto per raccogliere le modifiche

    // Verifica se il campo updateGiorno è una stringa non vuota prima di convertirlo in maiuscolo
    if (typeof updateGiorno === 'string' && updateGiorno.trim() !== '') {
      updateData.giorno = updateGiorno.toUpperCase();
    }

    // Verifica se il campo updateDescrizione è una stringa non vuota
    if (typeof updateDescrizione === 'string' && updateDescrizione.trim() !== '') {
      updateData.descrizione = updateDescrizione;
    }

    documentRef
      .update(updateData)
      .then(() => {
        //Modifica completata con successo
      })
      .catch((error) => {
        console.error("Si è verificato un errore durante la modifica");
      });
  }


  //Component Esercizio
  async getEserciziScheda(schedaID : string){ //FUNZIONA
    const email = getAuth().currentUser?.email; // Ottieni l'ID dell'utente corrente
    const collectionRef = this.firestore.collection('esercizi');
    const q = collectionRef.ref.where('schedaID', '==', schedaID);
    try {
      const querySnapshot = await getDocs(q);
      const esercizi: EsercizioInterface[] = [];

      querySnapshot.forEach((doc) => {
        const data:any= doc.data();
        const esercizio: EsercizioInterface = {
          documentID: doc.id,
          nomeEsercizio: data.nomeEsercizio,
          numSerieAllenanti: data.numSerieAllenanti,
          numSerieRiscaldamento: data.numSerieRiscaldamento,
          prepareTime: data.prepareTime,
          restAllenamento: data.restAllenamento,
          schedaID: schedaID,
          workTime: data.workTime
        };
        esercizi.push(esercizio);
      });
      return esercizi;
    } catch (error) {
      console.error('Errore durante il recupero dei documenti:', error);
      return [];
    }
  }
  nuovoEsercizio(schedaID : string){
    if(schedaID){
      const newEsercizio : EsercizioInterface = {
        nomeEsercizio: "Nome esercizio",
        numSerieAllenanti: 0,
        numSerieRiscaldamento: 0,
        prepareTime: 0,
        restAllenamento: 0,
        schedaID: schedaID,
        workTime: 0
      };
      this.addDocument("esercizi", newEsercizio).then();
    }
  }
  deleteEsercizio(documentID : string){//Funziona
    try {
      const documentRef = this.firestore.collection('esercizi').doc(documentID).delete();
    } catch (error){
      console.error("Errore eliminazione doc:", documentID);
    }
  }
  updateEsercizio(documentID : string, updatedData : Partial<EsercizioInterface>){
    const documentRef = this.firestore.collection('esercizi').doc(documentID);
    documentRef.update(updatedData)
      .then(() => {
      //Modifica completata con successo
    })
      .catch((error) => {
        console.error("Si è verificato un errore durante la modifica dell'esercizio");
      });
  }

  getEsercizio(documentID: string): Promise<EsercizioInterface | null> {
    const docRef = this.firestore.collection('esercizi').doc(documentID);
    return docRef.get().toPromise().then((snapshot:any) => {
      return snapshot.data() as EsercizioInterface;
    }).catch((error) => {
      console.error('Errore nel recupero dell\'esercizio');
      return null;
    });
  }
}
