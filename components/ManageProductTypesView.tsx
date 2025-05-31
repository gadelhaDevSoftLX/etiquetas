
import React, { useState } from 'react';
import { ManagedProductType } from '../types';
import InputField from './InputField';

interface ManageProductTypesViewProps {
  productTypesList: ManagedProductType[];
  onAddProductType: (name: string) => void;
  onDeleteProductType: (id: string) => void;
  onUpdateProductType: (id: string, newName: string) => void;
}

const ManageProductTypesView: React.FC<ManageProductTypesViewProps> = ({
  productTypesList,
  onAddProductType,
  onDeleteProductType,
  onUpdateProductType,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<ManagedProductType | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddProductType(newItemName.trim());
      setNewItemName('');
    }
  };

  const handleEdit = (item: ManagedProductType) => {
    setEditingItem(item);
    setEditName(item.name);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingItem && editName.trim()) {
      onUpdateProductType(editingItem.id, editName.trim());
      setEditingItem(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
  };

  return (
    <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 md:p-8 mt-4 md:mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-center text-orange-600 mb-6">
        Gerenciar Tipos de Produto
      </h2>

      {editingItem ? (
        <div className="mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md">
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Editando: {editingItem.name}</h3>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <InputField
              label="Novo Nome do Tipo de Produto"
              name="editItemName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Digite o novo nome"
            />
            <div className="flex gap-3 mt-1">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Adicionar Novo Tipo de Produto</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <InputField
              label="Nome do Tipo de Produto"
              name="newItemName"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Ex: Carnes, Sobremesas"
            />
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75"
            >
              Adicionar Tipo de Produto
            </button>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-orange-700 mb-4 pt-4 border-t border-slate-200">
          Lista de Tipos de Produto ({productTypesList.length})
        </h3>
        {productTypesList.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Nenhum tipo de produto cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {productTypesList.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-100 rounded-xl shadow border border-slate-200"
              >
                <span className="text-slate-800 flex-grow">{item.name}</span>
                <div className="space-x-2 flex-shrink-0">
                   <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    aria-label={`Editar ${item.name}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteProductType(item.id)}
                    className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                    aria-label={`Excluir ${item.name}`}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageProductTypesView;
