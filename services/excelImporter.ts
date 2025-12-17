import { read, utils } from 'xlsx';
import { Sheet, Column, Row } from '../types';

export const parseExcelFile = async (file: File): Promise<Sheet[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        const workbook = read(data, { type: 'array' });
        const newSheets: Sheet[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          // Get data as array of arrays
          const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (jsonData.length === 0) return;

          // Assume first row is headers
          const headers = jsonData[0];
          const rowsData = jsonData.slice(1);

          if (!headers || headers.length === 0) return;

          // Create columns
          const columns: Column[] = headers.map((h, i) => {
            const name = String(h || `Column ${i + 1}`).trim();
            // Basic type inference based on the first non-empty value in this column
            let type: 'text' | 'number' | 'boolean' = 'text';
            
            for (let r = 0; r < Math.min(rowsData.length, 5); r++) {
              const val = rowsData[r][i];
              if (val !== undefined && val !== null && val !== '') {
                if (typeof val === 'number') type = 'number';
                else if (typeof val === 'boolean') type = 'boolean';
                break;
              }
            }

            return {
              id: `col-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
              name,
              type
            };
          });

          // Default Primary Key to the first column
          const primaryKeyColumn = columns[0].name;

          // Create rows
          const rows: Row[] = rowsData.map((rowData, rIndex) => {
            const row: Row = { 
              id: `row-${Date.now()}-${rIndex}-${Math.random().toString(36).substr(2, 5)}` 
            };
            
            columns.forEach((col, cIndex) => {
              const val = rowData[cIndex];
              // Ensure undefined/null are handled gracefully, though types allow undefined
              row[col.name] = val; 
            });
            return row;
          });

          newSheets.push({
            id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: sheetName,
            columns,
            rows,
            primaryKeyColumn
          });
        });

        resolve(newSheets);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};