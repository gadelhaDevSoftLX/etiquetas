// export enum ConservacaoTipo { // Kept for reference, will be replaced by dynamic list
//   CONGELADO = 'CONGELADO',
//   RESFRIADO = 'RESFRIADO',
//   AMBIENTE = 'AMBIENTE',
//   NENHUM = '' 
// }

// export enum TipoProduto { // Kept for reference, will be replaced by dynamic list
//   CARNE_PORCIONADA = 'CARNE_PORCIONADA', 
//   PREPAROS = 'PREPAROS',                 
//   VEGETAIS = 'VEGETAIS',                 
//   ALIMENTO_SECO = 'ALIMENTO_SECO',
//   OUTRO = 'OUTRO', 
//   NENHUM = '' 
// }

// Special string constants for use in select dropdowns and logic
export const PRODUCT_TYPE_OTHER_NAME = "Outro (Validade Manual)"; // Name for "Outro" option
export const EMPTY_SELECT_VALUE = ''; // Represents "Selecione..." or no selection, or empty input

export interface LabelData {
  produto: string;
  dataManipulacao: string; // Stored as YYYY-MM-DD from date input
  validade: string;        // Stored as YYYY-MM-DD from date input
  responsavel: string;     // Stores the NAME of the selected ManagedResponsible or EMPTY_SELECT_VALUE
  tipoConservacao: string; // Stores the NAME of ManagedConservationType or EMPTY_SELECT_VALUE
  tipoProduto: string;     // Stores the NAME of ManagedProductType, PRODUCT_TYPE_OTHER_NAME, or EMPTY_SELECT_VALUE
  fornecedor: string;
}

export interface StoredLabelData extends LabelData {
  id: string;          // Unique ID for the stored label
  submissionDate: string; // ISO string of when it was submitted/generated
}

export enum View {
  LABEL_GENERATOR,
  VALIDITY_MONITOR, // New view for monitoring expirations
  MANAGE_RESPONSIBLES,
  MANAGE_PRODUCT_TYPES,
  MANAGE_ITEMS,
  MANAGE_CONSERVATION_TYPES,
}

export interface ManagedItem {
  id: string;
  name: string;
}

export interface ManagedResponsible extends ManagedItem {}

export interface ManagedProductType extends ManagedItem {}

export interface ManagedItemEntry extends ManagedItem { // Specific product item, e.g., "Bolo de Chocolate"
  productTypeId: string; // ID of the ManagedProductType it belongs to (e.g., "Sobremesas")
}

export interface ManagedConservationType extends ManagedItem {
  validityDays?: number | string; // Optional: default validity period in days for this type. Input can be string.
}