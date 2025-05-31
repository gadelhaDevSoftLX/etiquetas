
import React, { useState, useEffect } from 'react';
import { ManagedItemEntry, ManagedProductType, EMPTY_SELECT_VALUE } from '../types';
import InputField from './InputField';
import SelectField from './SelectField';

interface ManageItemsViewProps {
  itemsList: ManagedItemEntry[];
  productTypesList: ManagedProductType[];
  onAddItemEntry: (name: string, productTypeId: string) => void;
  onDeleteItemEntry: (id: string) => void;
  onUpdateItemEntry: (id: string, newName: string, newProductTypeId: string) => void;
}

const ManageItemsView: React.FC<ManageItemsViewProps> = ({
  itemsList,
  productTypesList,
  onAddItemEntry,
  onDeleteItemEntry,
  onUpdateItemEntry,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>(EMPTY_SELECT_VALUE);
  
  const [editingItem, setEditingItem] = useState<ManagedItemEntry | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editSelectedProductTypeId, setEditSelectedProductTypeId] = useState<string>(EMPTY_SELECT_VALUE);

  useEffect(() => {
    if (editingItem) {
      setEditItemName(editingItem.name);
      setEditSelectedProductTypeId(editingItem.productTypeId);
    } else {
      setEditItemName('');
      setEditSelectedProductTypeId(EMPTY_SELECT_VALUE);
    }
  }, [editingItem]);

  const productTypeOptions = [
    { value: EMPTY_SELECT_VALUE, label: 'Selecione um Tipo de Produto...' },
    ...productTypesList.map(pt => ({ value: pt.id, label: pt.name })),
  ];

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newItemName.trim() && selectedProductTypeId && selectedProductTypeId !== EMPTY_SELECT_VALUE) {
      onAddItemEntry(newItemName.trim(), selectedProductTypeId);
      setNewItemName('');
      setSelectedProductTypeId(EMPTY_SELECT_VALUE);
    } else {
      alert("Por favor, preencha o nome do item e selecione um tipo de produto.");
    }
  };

  const handleEdit = (item: ManagedItemEntry) => {
    setEditingItem(item);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingItem && editItemName.trim() && editSelectedProductTypeId && editSelectedProductTypeId !== EMPTY_SELECT_VALUE) {
      onUpdateItemEntry(editingItem.id, editItemName.trim(), editSelectedProductTypeId);
      setEditingItem(null);
    } else {
       alert("Por favor, preencha o nome do item e selecione um tipo de produto para atualizar.");
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };
  
  const getProductTypeName = (productTypeId: string) => {
    const type = productTypesList.find(pt => pt.id === productTypeId);
    return type ? type.name : 'Tipo Desconhecido';
  };

  return (
    <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 md:p-8 mt-4 md:mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-center text-orange-600 mb-6">
        Gerenciar Itens/Produtos
      </h2>

      {editingItem ? (
        <div className="mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md space-y-4">
          <h3 className="text-lg font-semibold text-orange-700">Editando Item: {editingItem.name}</h3>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <InputField
              label="Novo Nome do Item"
              name="editItemName"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              placeholder="Digite o novo nome do item"
            />
            <SelectField
              label="Novo Tipo de Produto"
              name="editItemProductType"
              value={editSelectedProductTypeId}
              onChange={(e) => setEditSelectedProductTypeId(e.target.value)}
              options={productTypeOptions}
            />
            <div className="flex gap-3 mt-1">
              <button type="submit" className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm">Salvar</button>
              <button type="button" onClick={handleCancelEdit} className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-sm">Cancelar</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Adicionar Novo Item/Produto</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <InputField
              label="Nome do Item/Produto"
              name="newItemName"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Ex: Bolo de Chocolate"
            />
            <SelectField
              label="Tipo de Produto Associado"
              name="itemProductType"
              value={selectedProductTypeId}
              onChange={(e) => setSelectedProductTypeId(e.target.value)}
              options={productTypeOptions}
            />
            <button type="submit" className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md">Adicionar Item</button>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-orange-700 mb-4 pt-4 border-t border-slate-200">
          Lista de Itens/Produtos ({itemsList.length})
        </h3>
        {itemsList.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Nenhum item cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {itemsList.map(item => (
              <li key={item.id} className="p-4 bg-slate-100 rounded-xl shadow border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex-grow mb-2 sm:mb-0">
                      <span className="text-slate-800 font-semibold">{item.name}</span>
                      <span className="block sm:inline sm:ml-2 text-xs text-slate-600">({getProductTypeName(item.productTypeId)})</span>
                  </div>
                  <div className="space-x-2 flex-shrink-0 self-start sm:self-center">
                     <button onClick={() => handleEdit(item)} className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm" aria-label={`Editar ${item.name}`}>Editar</button>
                     <button onClick={() => onDeleteItemEntry(item.id)} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm" aria-label={`Excluir ${item.name}`}>Excluir</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageItemsView;
