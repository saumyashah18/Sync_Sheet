import React, { useState } from 'react';
import { Sheet, Column } from '../types';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface CreateSheetModalProps {
  onSave: (sheet: Sheet) => void;
  onClose: () => void;
}

const CreateSheetModal: React.FC<CreateSheetModalProps> = ({ onSave, onClose }) => {
  const [sheetName, setSheetName] = useState('');
  const [primaryKey, setPrimaryKey] = useState('ID');
  const [columns, setColumns] = useState<{ name: string; type: 'text' | 'number' | 'select' | 'boolean'; optionsString?: string }[]>([]);

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'text', optionsString: '' }]);
  };

  const updateColumn = (index: number, field: string, value: any) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], [field]: value };
    setColumns(newCols);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetName.trim() || !primaryKey.trim()) return;

    const newSheetId = `sheet-${Date.now()}`;
    
    // Construct columns
    const finalColumns: Column[] = [
      // Always add Primary Key as the first column
      { id: `col-${Date.now()}-pk`, name: primaryKey, type: 'text' }, 
      ...columns
        .filter(c => c.name.trim() !== '')
        .map((c, i) => ({
          id: `col-${Date.now()}-${i}`,
          name: c.name,
          type: c.type,
          options: c.type === 'select' && c.optionsString ? c.optionsString.split(',').map(s => s.trim()) : undefined
        }))
    ];

    const newSheet: Sheet = {
      id: newSheetId,
      name: sheetName,
      primaryKeyColumn: primaryKey,
      columns: finalColumns,
      rows: []
    };

    onSave(newSheet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">Create New Sheet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="create-sheet-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sheet Name</label>
              <input 
                autoFocus
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="e.g. Inventory"
                value={sheetName}
                onChange={e => setSheetName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Key Column</label>
              <div className="text-xs text-gray-500 mb-1">This column links data across sheets (e.g., ProductID, Email).</div>
              <input 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="e.g. ID"
                value={primaryKey}
                onChange={e => setPrimaryKey(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Additional Columns</label>
                <button 
                  type="button" 
                  onClick={addColumn}
                  className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={14} /> Add Column
                </button>
              </div>
              
              <div className="space-y-3">
                {columns.length === 0 && (
                  <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded border border-dashed border-gray-200">
                    No additional columns yet. The Primary Key will be the first column.
                  </div>
                )}
                {columns.map((col, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <div className="flex-1 space-y-2">
                       <input 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                        placeholder="Column Name"
                        value={col.name}
                        onChange={e => updateColumn(idx, 'name', e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <select
                          className="w-1/3 border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                          value={col.type}
                          onChange={e => updateColumn(idx, 'type', e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="select">Select</option>
                          <option value="boolean">Boolean</option>
                        </select>
                        {col.type === 'select' && (
                           <input 
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                            placeholder="Options (comma separated)"
                            value={col.optionsString || ''}
                            onChange={e => updateColumn(idx, 'optionsString', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeColumn(idx)}
                      className="text-gray-400 hover:text-red-500 p-1 self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-sheet-form"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
          >
            <Save size={16} /> Create Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSheetModal;