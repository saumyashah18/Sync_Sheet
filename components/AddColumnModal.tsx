import React, { useState } from 'react';
import { Column } from '../types';
import { X, Save } from 'lucide-react';

interface AddColumnModalProps {
  onSave: (column: Column) => void;
  onClose: () => void;
}

const AddColumnModal: React.FC<AddColumnModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'select' | 'boolean'>('text');
  const [optionsString, setOptionsString] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      type,
      options: type === 'select' ? optionsString.split(',').map(s => s.trim()).filter(Boolean) : undefined
    };

    onSave(newColumn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">Add New Column</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="add-column-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
              <input 
                autoFocus
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Status"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={type}
                onChange={e => setType(e.target.value as any)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select (Dropdown)</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>

            {type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                <input 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Option 1, Option 2, Option 3"
                  value={optionsString}
                  onChange={e => setOptionsString(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
              </div>
            )}
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
            form="add-column-form"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
          >
            <Save size={16} /> Add Column
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnModal;