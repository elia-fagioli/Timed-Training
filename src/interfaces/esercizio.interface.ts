export interface EsercizioInterface{
  schedaID: string; //chiave del documento scheda associato
  documentID?: string;
  nomeEsercizio: string;
  prepareTime: number;
  workTime: number;
  restAllenamento: number;

  numSerieRiscaldamento: number;
  numSerieAllenanti: number;
}
