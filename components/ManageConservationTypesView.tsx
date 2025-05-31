
import React, { useState, useEffect } from 'react';
import { ManagedConservationType } from '../types';
import InputField from './InputField';

interface ManageConservationTypesViewProps {
  conservationTypesList: ManagedConservationType[];
  onAddConservationType: (name: string, validityDays?: number | string) => void;
  onDeleteConservationType: (id: string) => void;
  onUpdateConservationType: (id: string, newName: string, newValidityDays?: number | string) => void;
}

const ManageConservationTypesView: React.FC<ManageConservationTypesViewProps> = ({
  conservationTypesList,
  onAddConservationType,
  onDeleteConservationType,
  onUpdateConservationType,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemValidityDays, setNewItemValidityDays] = useState<string>('');
  
  const [editingItem, setEditingItem] = useState<ManagedConservationType | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemValidityDays, setEditItemValidityDays] = useState<string>('');

  useEffect(() => {
    if (editingItem) {
      setEditItemName(editingItem.name);
      setEditItemValidityDays(editingItem.validityDays !== undefined ? String(editingItem.validityDays) : '');
    } else {
      setEditItemName('');
      setEditItemValidityDays('');
    }
  }, [editingItem]);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newItemName.trim()) {
      const days = newItemValidityDays.trim() === '' ? undefined : parseInt(newItemValidityDays, 10);
      if (newItemValidityDays.trim() !== '' && (isNaN(days) || days < 0)) {
        alert("Dias de validade deve ser um número positivo ou deixado em branco.");
        return;
      }
      onAddConservationType(newItemName.trim(), days);
      setNewItemName('');
      setNewItemValidityDays('');
    }
  };

  const handleEdit = (item: ManagedConservationType) => {
    setEditingItem(item);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingItem && editItemName.trim()) {
      const days = editItemValidityDays.trim() === '' ? undefined : parseInt(editItemValidityDays, 10);
       if (editItemValidityDays.trim() !== '' && (isNaN(days) || days < 0)) {
        alert("Dias de validade deve ser um número positivo ou deixado em branco.");
        return;
      }
      onUpdateConservationType(editingItem.id, editItemName.trim(), days);
      setEditingItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 md:p-8 mt-4 md:mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-center text-orange-600 mb-6">
        Gerenciar Tipos de Conservação
      </h2>

      {editingItem ? (
        <div className="mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md space-y-4">
          <h3 className="text-lg font-semibold text-orange-700">Editando: {editingItem.name}</h3>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <InputField
              label="Novo Nome do Tipo de Conservação"
              name="editItemName"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              placeholder="Ex: Congelado, Resfriado"
            />
            <InputField
              label="Dias de Validade (Opcional)"
              name="editItemValidityDays"
              type="number"
              value={editItemValidityDays}
              onChange={(e) => setEditItemValidityDays(e.target.value)}
              placeholder="Ex: 90 (para 90 dias)"
            />
            <div className="flex gap-3 mt-1">
              <button type="submit" className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm">Salvar</button>
              <button type="button" onClick={handleCancelEdit} className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-sm">Cancelar</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Adicionar Novo Tipo de Conservação</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <InputField
              label="Nome do Tipo de Conservação"
              name="newItemName"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Ex: Congelamento Rápido"
            />
            <InputField
              label="Dias de Validade (Opcional)"
              name="newItemValidityDays"
              type="number"
              value={newItemValidityDays}
              onChange={(e) => setNewItemValidityDays(e.target.value)}
              placeholder="Deixe em branco se não aplicável"
            />
            <button type="submit" className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md">Adicionar Tipo de Conservação</button>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-orange-700 mb-4 pt-4 border-t border-slate-200">
          Lista de Tipos de Conservação ({conservationTypesList.length})
        </h3>
        {conservationTypesList.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Nenhum tipo de conservação cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {conservationTypesList.map(item => (
              <li key={item.id} className="flex items-center justify-between p-4 bg-slate-100 rounded-xl shadow border border-slate-200">
                <div className="flex-grow">
                  <span className="text-slate-800">{item.name}</span>
                  {item.validityDays !== undefined && (
                    <span className="ml-2 text-xs text-slate-500">({item.validityDays} dias)</span>
                  )}
                </div>
                <div className="space-x-2 flex-shrink-0">
                   <button onClick={() => handleEdit(item)} className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm" aria-label={`Editar ${item.name}`}>Editar</button>
                   <button onClick={() => onDeleteConservationType(item.id)} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm" aria-label={`Excluir ${item.name}`}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageConservationTypesView;
