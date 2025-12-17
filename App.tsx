import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_SHEETS } from './constants';
import { Sheet, AppState, Row, CellValue, Column } from './types';
import SheetGrid from './components/SheetGrid';
import DataForm from './components/DataForm';
import CreateSheetModal from './components/CreateSheetModal';
import AddColumnModal from './components/AddColumnModal';
import { Database, Plus, RefreshCw, MessageSquare, Table, Layout, Menu, X, Trash2, Upload } from 'lucide-react';
import { analyzeData } from './services/geminiService';
import { parseExcelFile } from './services/excelImporter';

const App: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>(INITIAL_SHEETS);
  const [activeSheetId, setActiveSheetId] = useState<string>(INITIAL_SHEETS[0].id);
  const [showForm, setShowForm] = useState(false);
  const [showCreateSheetModal, setShowCreateSheetModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to find rows in other sheets that match the primary key
  const findMatchingRows = (targetSheet: Sheet, primaryKeyCol: string, primaryKeyValue: CellValue) => {
    return targetSheet.rows.filter(r => String(r[primaryKeyCol]) === String(primaryKeyValue));
  };

  const handleUpdateCell = useCallback((sheetId: string, rowId: string, colName: string, newValue: CellValue) => {
    setSheets(prevSheets => {
      const sourceSheet = prevSheets.find(s => s.id === sheetId);
      if (!sourceSheet) return prevSheets;

      const sourceRow = sourceSheet.rows.find(r => r.id === rowId);
      if (!sourceRow) return prevSheets;

      const primaryKeyCol = sourceSheet.primaryKeyColumn;
      const primaryKeyValue = sourceRow[primaryKeyCol];
      
      // If we are editing the Primary Key itself, we need to decide if we update references (Cascading Update)
      // For simplicity, we will treat PK updates as just updating the value, which might break links unless we update all.
      // Let's implement Cascading PK Update if the column edited IS the primary key.
      const isPkUpdate = colName === primaryKeyCol;
      const oldPkValue = sourceRow[primaryKeyCol];

      const newSheets = prevSheets.map(sheet => {
        // 1. Update the source sheet
        if (sheet.id === sheetId) {
          return {
            ...sheet,
            rows: sheet.rows.map(row => 
              row.id === rowId ? { ...row, [colName]: newValue } : row
            )
          };
        }

        // 2. Interconnection Logic: Propagate changes to other sheets
        if (syncEnabled) {
          // Check if this sheet has the same column name
          const hasColumn = sheet.columns.some(c => c.name === colName);
          // Check if this sheet has the primary key column (to identify the row)
          const hasPrimaryKey = sheet.columns.some(c => c.name === primaryKeyCol);

          if (hasPrimaryKey) {
            return {
              ...sheet,
              rows: sheet.rows.map(row => {
                // If we are updating the PK itself, we look for the OLD PK value in linked sheets to update it
                if (isPkUpdate) {
                   if (String(row[primaryKeyCol]) === String(oldPkValue)) {
                     return { ...row, [colName]: newValue };
                   }
                } 
                // Normal update: Look for matching PK and update the attribute
                else if (hasColumn && String(row[primaryKeyCol]) === String(primaryKeyValue)) {
                  return { ...row, [colName]: newValue };
                }
                return row;
              })
            };
          }
        }
        return sheet;
      });

      return newSheets;
    });
  }, [syncEnabled]);

  const handleAddRow = (sheetId: string, newRowData: any) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id === sheetId) {
        const newRow: Row = {
          id: `row-${Date.now()}`,
          ...newRowData
        };
        return {
          ...sheet,
          rows: [...sheet.rows, newRow]
        };
      }
      return sheet;
    }));
    setShowForm(false);
  };

  const handleDeleteRow = (sheetId: string, rowId: string) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id === sheetId) {
        return {
          ...sheet,
          rows: sheet.rows.filter(r => r.id !== rowId)
        };
      }
      return sheet;
    }));
  };

  const handleCreateSheet = (newSheet: Sheet) => {
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
    setShowCreateSheetModal(false);
  };

  const handleDeleteSheet = () => {
    if (sheets.length <= 1) {
      alert("You must have at least one sheet.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this sheet? This action cannot be undone.")) {
      setSheets(prev => {
        const newSheets = prev.filter(s => s.id !== activeSheetId);
        setActiveSheetId(newSheets[0].id);
        return newSheets;
      });
    }
  };

  const handleAddColumn = (newColumn: Column) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        return {
          ...sheet,
          columns: [...sheet.columns, newColumn]
        };
      }
      return sheet;
    }));
    setShowAddColumnModal(false);
  };

  const handleAiAnalysis = async () => {
    if (!aiQuery) return;
    setIsAiLoading(true);
    setAiResponse(null);
    const response = await analyzeData(sheets, aiQuery);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newSheets = await parseExcelFile(file);
      if (newSheets.length > 0) {
        setSheets(prev => [...prev, ...newSheets]);
        setActiveSheetId(newSheets[0].id);
        alert(`Successfully imported ${newSheets.length} sheet(s)!`);
      } else {
        alert("No valid data found in the file.");
      }
    } catch (error) {
      alert("Error importing file. Please ensure it is a valid Excel file.");
      console.error(error);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeSheet = sheets.find(s => s.id === activeSheetId);

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".xlsx, .xls"
      />
      
      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-blue-500 p-1.5 rounded">
               <Table size={20} className="text-white" />
            </div>
            <span>SyncSheet</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sheets</div>
            <div className="flex gap-2">
              <button 
                onClick={handleImportClick}
                className="text-gray-400 hover:text-white transition-colors"
                title="Import Excel"
              >
                <Upload size={16} />
              </button>
              <button 
                onClick={() => setShowCreateSheetModal(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Create New Sheet"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <nav className="space-y-1">
            {sheets.map(sheet => (
              <button
                key={sheet.id}
                onClick={() => {
                  setActiveSheetId(sheet.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSheetId === sheet.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Layout size={16} className="mr-3" />
                <span className="truncate">{sheet.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2 mb-4">
             <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${syncEnabled ? 'bg-green-500' : 'bg-gray-600'}`} onClick={() => setSyncEnabled(!syncEnabled)}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${syncEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
             </div>
             <span className="text-xs text-gray-400">Auto-Sync Data</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
             <div className="flex items-center gap-2 text-sm font-medium text-blue-400 mb-2">
               <MessageSquare size={14} /> Ask AI Analyst
             </div>
             <input 
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Ask about your data..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAnalysis()}
             />
             {isAiLoading && <div className="text-xs text-gray-500 mt-2 animate-pulse">Thinking...</div>}
             {aiResponse && (
               <div className="mt-2 text-xs text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-700 max-h-32 overflow-y-auto custom-scrollbar">
                 {aiResponse}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-500">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {activeSheet?.name}
              <span className="text-xs font-normal text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                Key: {activeSheet?.primaryKeyColumn}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={handleDeleteSheet}
               className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-md transition-colors"
               title="Delete Sheet"
             >
               <Trash2 size={20} />
             </button>
             <div className="h-6 w-px bg-gray-200 mx-1"></div>
             <button 
               onClick={() => setShowForm(!showForm)}
               className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${
                 showForm 
                 ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                 : 'bg-blue-600 text-white hover:bg-blue-700'
               }`}
             >
               {showForm ? <X size={16} /> : <Plus size={16} />}
               {showForm ? 'Close Form' : 'Add Data'}
             </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-hidden relative flex">
          {/* Grid Container */}
          <div className="flex-1 h-full overflow-hidden flex flex-col">
            {activeSheet ? (
              <SheetGrid 
                sheet={activeSheet} 
                onUpdateCell={(rowId, colName, val) => handleUpdateCell(activeSheet.id, rowId, colName, val)}
                onDeleteRow={(rowId) => handleDeleteRow(activeSheet.id, rowId)}
                onAddRow={() => setShowForm(true)}
                onAddColumnTrigger={() => setShowAddColumnModal(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Select a sheet</div>
            )}
          </div>

          {/* Right Sidebar Form */}
          {showForm && activeSheet && (
             <div className="absolute top-0 right-0 bottom-0 h-full shadow-2xl transition-transform animate-slide-in-right">
                <DataForm 
                  sheet={activeSheet} 
                  onSave={(data) => handleAddRow(activeSheet.id, data)}
                  onClose={() => setShowForm(false)}
                />
             </div>
          )}
        </main>
      </div>
      
      {/* Create Sheet Modal */}
      {showCreateSheetModal && (
        <CreateSheetModal 
          onSave={handleCreateSheet} 
          onClose={() => setShowCreateSheetModal(false)} 
        />
      )}

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <AddColumnModal
          onSave={handleAddColumn}
          onClose={() => setShowAddColumnModal(false)}
        />
      )}
    </div>
  );
};

export default App;