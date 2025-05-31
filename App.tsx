
import React, { useState, useEffect, useCallback } from 'react';
import { View, ManagedResponsible, ManagedProductType, ManagedItemEntry, ManagedConservationType, StoredLabelData, LabelData } from './types';
import Navigation from './components/Navigation';
import LabelGeneratorView from './components/LabelGeneratorView';
import ManageResponsiblesView from './components/ManageResponsiblesView';
import ManageProductTypesView from './components/ManageProductTypesView';
import ManageItemsView from './components/ManageItemsView';
import ManageConservationTypesView from './components/ManageConservationTypesView';
import ValidityMonitorView from './components/ValidityMonitorView';

const parseValidityDays = (validityString: string): number | undefined => {
  if (!validityString) return undefined;
  const match = validityString.match(/(\d+)/);
  if (match && match[0]) {
    return parseInt(match[0], 10);
  }
  return undefined;
};

const rawInitialProductTypesData = [
  { name: "Laticínios (abertos)" },
  { name: "Queijos fracionados" },
  { name: "Massa cozida" },
  { name: "Hortifruti higienizado" },
  { name: "Carne crua congelada" },
  { name: "Carne crua resfriada" },
  { name: "Peixes e frutos do mar" },
  { name: "Frango cru resfriado" },
  { name: "Frango temperado" },
  { name: "Preparações prontas" },
  { name: "Sopas e caldos" },
  { name: "Doces e sobremesas" },
  { name: "Alimentos secos (arroz, farinha, grãos)" },
  { name: "Pães e bolos caseiros" },
  { name: "Ovos crus com casca" },
  { name: "Ovos cozidos descascados" },
];

const rawInitialConservationTypesData = [
  { name: "Refrigerado (Laticínios: 3 a 5 dias)", spreadsheetVal: "3 a 5 dias" },
  { name: "Refrigerado (Queijos fracionados: 5 dias)", spreadsheetVal: "5 dias" },
  { name: "Refrigerado (Massa cozida: 3 dias)", spreadsheetVal: "3 dias" },
  { name: "Refrigerado (Hortifruti: 2 dias)", spreadsheetVal: "2 dias" },
  { name: "Congelado (Carne crua: 90 dias)", spreadsheetVal: "90 dias" },
  { name: "Refrigerado (Carne crua: 3 dias)", spreadsheetVal: "3 dias" },
  { name: "Refrigerado (Peixes/Frutos do mar: 1 a 2 dias)", spreadsheetVal: "1 a 2 dias" },
  { name: "Refrigerado (Frango cru: 2 dias)", spreadsheetVal: "2 dias" },
  { name: "Refrigerado (Frango temperado: 1 a 2 dias)", spreadsheetVal: "1 a 2 dias" },
  { name: "Refrigerado (Preparações prontas: 3 dias)", spreadsheetVal: "3 dias" },
  { name: "Refrigerado (Sopas/Caldos: 3 dias)", spreadsheetVal: "3 dias" },
  { name: "Refrigerado (Doces/Sobremesas: 3 a 5 dias)", spreadsheetVal: "3 a 5 dias" },
  { name: "Temperatura ambiente (Alimentos secos: 30 a 90 dias)", spreadsheetVal: "30 a 90 dias" },
  { name: "Temperatura ambiente (Pães/Bolos: 3 dias)", spreadsheetVal: "3 dias" },
  { name: "Refrigerado (Ovos crus c/ casca: 7 dias após abertura)", spreadsheetVal: "7 dias (após abertura da caixa)" },
  { name: "Refrigerado (Ovos cozidos descascados: 2 dias)", spreadsheetVal: "2 dias" },
];

// Deduplicate conservation types based on name and parsed validity days to create the final list
const uniqueConservationTypesMap = new Map<string, { name: string; validityDays?: number }>();
rawInitialConservationTypesData.forEach(item => {
  const validityDays = parseValidityDays(item.spreadsheetVal);
  // Use a key that combines name and validity for uniqueness if desired, or just name if names are already unique
  // For this list, the constructed names are unique enough.
  if (!uniqueConservationTypesMap.has(item.name)) {
      uniqueConservationTypesMap.set(item.name, { name: item.name, validityDays });
  }
});
const initialConservationTypes: ManagedConservationType[] = 
  Array.from(uniqueConservationTypesMap.values()).map(ct => ({
    id: crypto.randomUUID(),
    name: ct.name,
    validityDays: ct.validityDays,
  }));

const initialProductTypes: ManagedProductType[] = rawInitialProductTypesData.map(pt => ({
  id: crypto.randomUUID(),
  name: pt.name,
}));


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LABEL_GENERATOR);
  
  const [responsiblesList, setResponsiblesList] = useState<ManagedResponsible[]>([]);
  const [productTypesList, setProductTypesList] = useState<ManagedProductType[]>([]);
  const [itemsList, setItemsList] = useState<ManagedItemEntry[]>([]);
  const [conservationTypesList, setConservationTypesList] = useState<ManagedConservationType[]>([]);
  const [storedLabelsList, setStoredLabelsList] = useState<StoredLabelData[]>([]);

  const loadFromLocalStorageWithDefaults = <T,>(
    key: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    validator: (item: any) => boolean,
    defaultData: T[] = [] // Provide defaultData, empty if not pre-populating
  ) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        const parsedValue = JSON.parse(storedValue);
        if (Array.isArray(parsedValue) && (parsedValue.length === 0 || parsedValue.every(validator))) { // Allow empty array as valid
          setter(parsedValue as T[]);
        } else {
          console.warn(`Stored ${key} is not in the expected format or failed validation. Initializing with defaults.`);
          setter(defaultData);
          localStorage.setItem(key, JSON.stringify(defaultData));
        }
      } catch (error) {
        console.error(`Failed to parse ${key} from localStorage. Initializing with defaults:`, error);
        setter(defaultData);
        localStorage.setItem(key, JSON.stringify(defaultData));
      }
    } else {
        setter(defaultData); // Nothing stored, use defaultData
        if (defaultData.length > 0) { // Only save if defaultData is not empty
             localStorage.setItem(key, JSON.stringify(defaultData));
        } else { // If defaultData is empty and nothing is stored, still ensure key is set to empty array
             localStorage.setItem(key, JSON.stringify([]));
        }
    }
  };
  
  useEffect(() => {
    loadFromLocalStorageWithDefaults<ManagedResponsible>('responsiblesList', setResponsiblesList, item => typeof item.id === 'string' && typeof item.name === 'string');
    loadFromLocalStorageWithDefaults<ManagedProductType>('productTypesList', setProductTypesList, item => typeof item.id === 'string' && typeof item.name === 'string', initialProductTypes);
    loadFromLocalStorageWithDefaults<ManagedItemEntry>('itemsList', setItemsList, item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.productTypeId === 'string');
    loadFromLocalStorageWithDefaults<ManagedConservationType>('conservationTypesList', setConservationTypesList, item => typeof item.id === 'string' && typeof item.name === 'string' && (item.validityDays === undefined || typeof item.validityDays === 'number'), initialConservationTypes);
    
    // Validator for StoredLabelData reflects that LabelData fields (responsavel, tipoProduto, tipoConservacao) are strings (names).
    loadFromLocalStorageWithDefaults<StoredLabelData>('storedLabelsList', setStoredLabelsList, item => 
        typeof item.id === 'string' && 
        typeof item.submissionDate === 'string' && 
        typeof item.produto === 'string' &&
        typeof item.dataManipulacao === 'string' &&
        typeof item.validade === 'string' &&
        typeof item.responsavel === 'string' &&      // Now a name
        typeof item.tipoConservacao === 'string' && // Now a name
        typeof item.tipoProduto === 'string' &&     // Now a name
        typeof item.fornecedor === 'string'
    );
  }, []);

  const saveToLocalStorage = <T,>(key: string, value: T[]) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  useEffect(() => saveToLocalStorage('responsiblesList', responsiblesList), [responsiblesList]);
  useEffect(() => saveToLocalStorage('productTypesList', productTypesList), [productTypesList]);
  useEffect(() => saveToLocalStorage('itemsList', itemsList), [itemsList]);
  useEffect(() => saveToLocalStorage('conservationTypesList', conservationTypesList), [conservationTypesList]);
  useEffect(() => saveToLocalStorage('storedLabelsList', storedLabelsList), [storedLabelsList]);

  const handleAddGeneratedLabel = useCallback((label: LabelData) => {
    const newStoredLabel: StoredLabelData = {
      ...label,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
    };
    setStoredLabelsList(prev => [...prev, newStoredLabel]);
  }, []);


  const addResponsible = useCallback((name: string) => {
    if (name.trim() === '') return;
    const newItem: ManagedResponsible = { id: crypto.randomUUID(), name: name.trim() };
    setResponsiblesList(prev => [...prev, newItem]);
  }, []);

  const deleteResponsible = useCallback((id: string) => {
    setResponsiblesList(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateResponsible = useCallback((id: string, newName: string) => {
    if (newName.trim() === '') return;
    setResponsiblesList(prev => 
      prev.map(item => {
        if (item.id === id) {
          return { ...item, name: newName.trim() };
        }
        return item;
      })
    );
  }, []);

  const addProductType = useCallback((name: string) => {
    if (name.trim() === '') return;
    const newItem: ManagedProductType = { id: crypto.randomUUID(), name: name.trim() };
    setProductTypesList(prev => [...prev, newItem]);
  }, []);

  const deleteProductType = useCallback((id: string) => {
    setProductTypesList(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateProductType = useCallback((id: string, newName: string) => {
    if (newName.trim() === '') return;
    setProductTypesList(prev => 
      prev.map(item => {
        if (item.id === id) {
          return { ...item, name: newName.trim() };
        }
        return item;
      })
    );
  }, []);

  const addItemEntry = useCallback((name: string, productTypeId: string) => {
    if (name.trim() === '' || productTypeId.trim() === '') return;
    const newItem: ManagedItemEntry = { id: crypto.randomUUID(), name: name.trim(), productTypeId };
    setItemsList(prev => [...prev, newItem]);
  }, []);

  const deleteItemEntry = useCallback((id: string) => {
    setItemsList(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItemEntry = useCallback((id: string, newName: string, newProductTypeId: string) => {
    if (newName.trim() === '' || newProductTypeId.trim() === '') return;
    setItemsList(prev => 
      prev.map(item => {
        if (item.id === id) {
          return { ...item, name: newName.trim(), productTypeId: newProductTypeId };
        }
        return item;
      })
    );
  }, []);

  const addConservationType = useCallback((name: string, validityDaysInput?: number | string) => {
    if (name.trim() === '') return;
    const days = typeof validityDaysInput === 'string' ? parseInt(validityDaysInput, 10) : validityDaysInput;
    const newItem: ManagedConservationType = { 
        id: crypto.randomUUID(), 
        name: name.trim(),
        ...(days !== undefined && !isNaN(days) && { validityDays: days })
    };
    setConservationTypesList(prev => [...prev, newItem]);
  }, []);

  const deleteConservationType = useCallback((id: string) => {
    setConservationTypesList(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateConservationType = useCallback((id: string, newName: string, newValidityDaysInput?: number | string) => {
    if (newName.trim() === '') return;
    const days = typeof newValidityDaysInput === 'string' ? parseInt(newValidityDaysInput, 10) : newValidityDaysInput;
    setConservationTypesList(prev => 
      prev.map(item => {
        if (item.id === id) {
          return { 
              ...item, 
              name: newName.trim(), 
              validityDays: (days !== undefined && !isNaN(days)) ? days : undefined
          };
        }
        return item;
      })
    );
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col bg-white md:shadow-lg print:shadow-none md:rounded-xl">
      <main className="flex-grow flex flex-col items-center w-full overflow-y-auto p-3 sm:p-4 bg-slate-100 print:bg-white print:p-0 pb-20 md:pb-24"> {/* Adjusted padding */}
        {currentView === View.LABEL_GENERATOR && (
          <LabelGeneratorView 
            responsiblesList={responsiblesList}
            productTypesList={productTypesList}
            conservationTypesList={conservationTypesList}
            itemsList={itemsList}
            onAddGeneratedLabel={handleAddGeneratedLabel}
          />
        )}
        {currentView === View.VALIDITY_MONITOR && (
          <ValidityMonitorView 
            storedLabels={storedLabelsList}
            responsiblesList={responsiblesList}
            productTypesList={productTypesList}
            conservationTypesList={conservationTypesList}
          /> 
        )}
        {currentView === View.MANAGE_RESPONSIBLES && (
          <ManageResponsiblesView
            responsiblesList={responsiblesList}
            onAddResponsible={addResponsible}
            onDeleteResponsible={deleteResponsible}
            onUpdateResponsible={updateResponsible}
          />
        )}
        {currentView === View.MANAGE_PRODUCT_TYPES && (
          <ManageProductTypesView
            productTypesList={productTypesList}
            onAddProductType={addProductType}
            onDeleteProductType={deleteProductType}
            onUpdateProductType={updateProductType}
          />
        )}
        {currentView === View.MANAGE_ITEMS && (
          <ManageItemsView
            itemsList={itemsList}
            productTypesList={productTypesList}
            onAddItemEntry={addItemEntry}
            onDeleteItemEntry={deleteItemEntry}
            onUpdateItemEntry={updateItemEntry}
          />
        )}
        {currentView === View.MANAGE_CONSERVATION_TYPES && (
          <ManageConservationTypesView
            conservationTypesList={conservationTypesList}
            onAddConservationType={addConservationType}
            onDeleteConservationType={deleteConservationType}
            onUpdateConservationType={updateConservationType}
          />
        )}
      </main>
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;