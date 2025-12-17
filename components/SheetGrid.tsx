import React, { useState, useEffect, useRef } from 'react';
import { Sheet, Row, Column, CellValue } from '../types';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface SheetGridProps {
  sheet: Sheet;
  onUpdateCell: (rowId: string, colName: string, value: CellValue) => void;
  onDeleteRow: (rowId: string) => void;
  onAddRow: () => void;
  onAddColumnTrigger?: () => void;
}

const SheetGrid: React.FC<SheetGridProps> = ({ sheet, onUpdateCell, onDeleteRow, onAddRow, onAddColumnTrigger }) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; colName: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = (rowId: string, colName: string, value: CellValue) => {
    setEditingCell({ rowId, colName });
    setEditValue(String(value ?? ''));
  };

  const handleBlur = () => {
    if (editingCell) {
      onUpdateCell(editingCell.rowId, editingCell.colName, editValue);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-auto custom-scrollbar flex-1 relative">
        <table className="min-w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr>
              <th className="p-3 w-12 border-b border-r border-gray-200 bg-gray-50 text-xs font-semibold text-gray-400 text-center select-none">
                #
              </th>
              {sheet.columns.map((col) => (
                <th key={col.id} className="p-3 border-b border-r border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center justify-between">
                    <span>{col.name}</span>
                    {col.name === sheet.primaryKeyColumn && (
                      <span title="Primary Key (Link)" className="text-blue-500 text-[10px] bg-blue-50 px-1 rounded ml-2">KEY</span>
                    )}
                  </div>
                </th>
              ))}
              {onAddColumnTrigger && (
                <th className="p-3 border-b border-r border-gray-200 w-10 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer" onClick={onAddColumnTrigger} title="Add Column">
                  <div className="flex items-center justify-center text-gray-400 hover:text-blue-600">
                    <Plus size={16} />
                  </div>
                </th>
              )}
              <th className="p-3 border-b border-gray-200 w-16 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sheet.rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50 transition-colors group">
                <td className="p-3 border-r border-gray-100 text-xs text-gray-400 text-center select-none bg-gray-50 group-hover:bg-blue-50">
                  {index + 1}
                </td>
                {sheet.columns.map((col) => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colName === col.name;
                  const cellValue = row[col.name];
                  
                  return (
                    <td 
                      key={`${row.id}-${col.id}`} 
                      className="border-r border-gray-100 p-0 h-10 relative min-w-[150px]"
                      onClick={() => handleCellClick(row.id, col.name, cellValue)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type={col.type === 'number' ? 'number' : 'text'}
                          className="w-full h-full px-3 py-2 text-sm text-gray-900 border-2 border-blue-500 focus:outline-none bg-white z-20 absolute top-0 left-0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        <div className="w-full h-full px-3 py-2 text-sm text-gray-700 truncate cursor-pointer">
                           {cellValue !== undefined && cellValue !== null ? String(cellValue) : ''}
                        </div>
                      )}
                    </td>
                  );
                })}
                {onAddColumnTrigger && <td className="border-r border-gray-100 bg-gray-50/30"></td>}
                <td className="p-2 text-center">
                  <button 
                    onClick={() => onDeleteRow(row.id)}
                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sheet.rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="mb-4">No data in this sheet</p>
            <button 
              onClick={onAddRow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Add First Row
            </button>
          </div>
        )}
      </div>
      
      <div className="p-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <span>{sheet.rows.length} rows</span>
        <button 
          onClick={onAddRow}
          className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-100 transition"
        >
          <Plus size={14} /> New Row
        </button>
      </div>
    </div>
  );
};

export default SheetGrid;