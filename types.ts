export type CellValue = string | number | boolean;

export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[]; // For select type
}

export interface Row {
  id: string; // Internal unique ID for React keys
  [key: string]: CellValue; // Dynamic keys corresponding to Column IDs (or names)
}

export interface Sheet {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
  primaryKeyColumn: string; // The column name used to link rows across sheets (e.g., "Employee ID")
}

export interface AppState {
  sheets: Sheet[];
  activeSheetId: string;
}
