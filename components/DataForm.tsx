import React, { useState } from 'react';
import { Sheet, Column } from '../types';
import { Sparkles, Save, X } from 'lucide-react';
import { generateRowData } from '../services/geminiService';

interface DataFormProps {
  sheet: Sheet;
  onSave: (data: any) => void;
  onClose: () => void;
}

const DataForm: React.FC<DataFormProps> = ({ sheet, onSave, onClose }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (colName: string, value: any) => {
    setFormData(prev => ({ ...prev, [colName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({});
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedData = await generateRowData(sheet, aiPrompt);
      if (generatedData) {
        setFormData(prev => ({ ...prev, ...generatedData }));
      }
    } catch (err) {
      alert("Failed to generate data. Check console/API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl w-80 lg:w-96 z-20">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Add to {sheet.name}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-gray-100 bg-blue-50/50">
        <label className="block text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
          <Sparkles size={12} /> AI Autofill
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 text-sm border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="e.g. 'Jane Doe, HR, jane@hr.com'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
          />
          <button 
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? '...' : 'Fill'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <form id="add-row-form" onSubmit={handleSubmit}>
          {sheet.columns.map((col) => (
            <div key={col.id} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {col.name} {col.name === sheet.primaryKeyColumn && <span className="text-xs text-blue-500">(Link Key)</span>}
              </label>
              {col.type === 'select' && col.options ? (
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData[col.name] || ''}
                  onChange={(e) => handleChange(col.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  {col.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={col.type === 'number' ? 'number' : 'text'}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData[col.name] || ''}
                  onChange={(e) => handleChange(col.name, col.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={`Enter ${col.name}`}
                  required={col.name === sheet.primaryKeyColumn}
                />
              )}
            </div>
          ))}
        </form>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          type="submit"
          form="add-row-form"
          className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition shadow-sm"
        >
          <Save size={16} /> Save Row
        </button>
      </div>
    </div>
  );
};

export default DataForm;
