
import React, { useState, useEffect, useCallback } from 'react';
import { StoredLabelData, ManagedResponsible, ManagedProductType, ManagedConservationType, EMPTY_SELECT_VALUE, PRODUCT_TYPE_OTHER_NAME } from '../types';
import InputField from './InputField';
import SelectField from './SelectField';
import FilterIcon from './icons/FilterIcon';

interface ValidityCardProps {
  period: string;
  count: number;
  date: string;
  bgColorClass: string;
  textColorClass?: string;
}

const ValidityCard: React.FC<ValidityCardProps> = ({ period, count, date, bgColorClass, textColorClass = 'text-white' }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-600 text-sm">{period}</p>
          <p className="text-2xl font-bold text-slate-800">{count}</p>
          <p className="text-xs text-slate-500">Etiquetas</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColorClass} ${textColorClass}`}>
          {date}
        </span>
      </div>
    </div>
  );
};

interface FilterCriteria {
  produto?: string;
  dataManipulacaoDe?: string;
  dataManipulacaoAte?: string;
  validadeDe?: string;
  validadeAte?: string;
  responsavel?: string;     // Now stores name or EMPTY_SELECT_VALUE
  tipoConservacao?: string; // Now stores name or EMPTY_SELECT_VALUE
  tipoProduto?: string;     // Now stores name or EMPTY_SELECT_VALUE
  fornecedor?: string;
}

const initialFilterCriteria: FilterCriteria = {
  produto: '',
  dataManipulacaoDe: '',
  dataManipulacaoAte: '',
  validadeDe: '',
  validadeAte: '',
  responsavel: EMPTY_SELECT_VALUE,
  tipoConservacao: EMPTY_SELECT_VALUE,
  tipoProduto: EMPTY_SELECT_VALUE,
  fornecedor: '',
};

// Sorting configuration
type SortField = 'validade' | 'submissionDate';
type SortOrder = 'asc' | 'desc';
interface SortConfig {
  field: SortField;
  order: SortOrder;
  label: string; // For button display and active state checking
}

const sortOptions: SortConfig[] = [
  { field: 'submissionDate', order: 'desc', label: 'Criação: Mais Recentes' },
  { field: 'validade', order: 'asc', label: 'Validade: Próximas Primeiro' },
  { field: 'validade', order: 'desc', label: 'Validade: Distantes Primeiro' },
];


interface ValidityMonitorViewProps {
  storedLabels: StoredLabelData[];
  responsiblesList: ManagedResponsible[];
  productTypesList: ManagedProductType[];
  conservationTypesList: ManagedConservationType[];
}

const ValidityMonitorView: React.FC<ValidityMonitorViewProps> = ({
  storedLabels,
  responsiblesList,
  productTypesList,
  conservationTypesList,
}) => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>(initialFilterCriteria);
  const [filteredDisplayLabels, setFilteredDisplayLabels] = useState<StoredLabelData[]>(storedLabels);
  const [activeSortConfig, setActiveSortConfig] = useState<SortConfig>(sortOptions[0]); // Default sort

  const formatDateForDisplay = (dateString: string | Date): string => {
    if (!dateString) return "";
    const date = typeof dateString === 'string' ? new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00') : dateString;
    if (isNaN(date.getTime())) return "Inválida";
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(today.getDate() - 1);
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(today.getDate() + 1);

  const [summaryCounts, setSummaryCounts] = useState({ yesterday: 0, today: 0, tomorrow: 0 });

  useEffect(() => {
    const todayStr = formatDateForComparison(today);
    const yesterdayStr = formatDateForComparison(yesterdayDate);
    const tomorrowStr = formatDateForComparison(tomorrowDate);

    let yesterdayCount = 0;
    let todayCount = 0;
    let tomorrowCount = 0;

    storedLabels.forEach(label => {
      if (label.validade === yesterdayStr) yesterdayCount++;
      if (label.validade === todayStr) todayCount++;
      if (label.validade === tomorrowStr) tomorrowCount++;
    });
    setSummaryCounts({ yesterday: yesterdayCount, today: todayCount, tomorrow: tomorrowCount });
  }, [storedLabels, today, yesterdayDate, tomorrowDate]);


  const applyFiltersAndSort = useCallback(() => {
    let labels = [...storedLabels];

    if (activeFilters.produto) {
      labels = labels.filter(label => label.produto.toLowerCase().includes(activeFilters.produto!.toLowerCase()));
    }
    if (activeFilters.fornecedor) {
      labels = labels.filter(label => label.fornecedor.toLowerCase().includes(activeFilters.fornecedor!.toLowerCase()));
    }
    // Filter by name for responsavel, tipoProduto, tipoConservacao
    if (activeFilters.responsavel && activeFilters.responsavel !== EMPTY_SELECT_VALUE) {
      labels = labels.filter(label => label.responsavel === activeFilters.responsavel);
    }
    if (activeFilters.tipoProduto && activeFilters.tipoProduto !== EMPTY_SELECT_VALUE) {
      labels = labels.filter(label => label.tipoProduto === activeFilters.tipoProduto);
    }
    if (activeFilters.tipoConservacao && activeFilters.tipoConservacao !== EMPTY_SELECT_VALUE) {
      labels = labels.filter(label => label.tipoConservacao === activeFilters.tipoConservacao);
    }
    if (activeFilters.dataManipulacaoDe) {
      labels = labels.filter(label => label.dataManipulacao >= activeFilters.dataManipulacaoDe!);
    }
    if (activeFilters.dataManipulacaoAte) {
      labels = labels.filter(label => label.dataManipulacao <= activeFilters.dataManipulacaoAte!);
    }
    if (activeFilters.validadeDe) {
      labels = labels.filter(label => label.validade >= activeFilters.validadeDe!);
    }
    if (activeFilters.validadeAte) {
      labels = labels.filter(label => label.validade <= activeFilters.validadeAte!);
    }
    
    labels.sort((a, b) => {
      if (activeSortConfig.field === 'validade') {
        const dateA = a.validade; 
        const dateB = b.validade; 
        return activeSortConfig.order === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      } else { 
        const timeA = new Date(a.submissionDate).getTime();
        const timeB = new Date(b.submissionDate).getTime();
        return activeSortConfig.order === 'asc' ? timeA - timeB : timeB - timeA;
      }
    });

    setFilteredDisplayLabels(labels);
  }, [activeFilters, storedLabels, activeSortConfig]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);


  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActiveFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Value from SelectField is now the name itself or EMPTY_SELECT_VALUE
    setActiveFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters(initialFilterCriteria);
  };
  
  // These functions now directly return the name or a default if empty/N/A
  const getResponsibleName = (name: string) => name && name !== EMPTY_SELECT_VALUE ? name : 'N/A';
  const getProductTypeName = (name: string) => name && name !== EMPTY_SELECT_VALUE ? name : 'N/A';
  const getConservationTypeName = (name: string) => name && name !== EMPTY_SELECT_VALUE ? name : 'N/A';


  const summaryData = [
    { period: 'Ontem', count: summaryCounts.yesterday, date: formatDateForDisplay(yesterdayDate), bgColorClass: 'bg-red-400' },
    { period: 'Hoje', count: summaryCounts.today, date: formatDateForDisplay(today), bgColorClass: 'bg-orange-400' },
    { period: 'Amanhã', count: summaryCounts.tomorrow, date: formatDateForDisplay(tomorrowDate), bgColorClass: 'bg-green-400' },
  ];
  
  // Filter dropdown options use names for both value and label
  const responsibleOptions = [{ value: EMPTY_SELECT_VALUE, label: 'Todos' }, ...responsiblesList.map(r => ({ value: r.name, label: r.name }))];
  const productTypeOptions = [{ value: EMPTY_SELECT_VALUE, label: 'Todos' }, ...productTypesList.map(pt => ({ value: pt.name, label: pt.name })), { value: PRODUCT_TYPE_OTHER_NAME, label: PRODUCT_TYPE_OTHER_NAME }];
  const conservationTypeOptions = [{ value: EMPTY_SELECT_VALUE, label: 'Todos' }, ...conservationTypesList.map(ct => ({ value: ct.name, label: ct.name }))];

  return (
    <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 md:p-8 mt-4 md:mt-6">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 text-center">
        Monitoria de validades
      </h1>
      <p className="text-sm text-slate-500 mb-6 text-center">
        Resumo de etiquetas próximas ao vencimento.
      </p>

      <div className="space-y-4 mb-8">
        {summaryData.map((data) => (
          <ValidityCard
            key={data.period}
            period={data.period}
            count={data.count}
            date={data.date}
            bgColorClass={data.bgColorClass}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFiltersVisible(!filtersVisible)}
        className="w-full flex items-center justify-center px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition duration-150 ease-in-out mb-6"
        aria-controls="filter-panel"
        aria-expanded={filtersVisible}
      >
        <FilterIcon className="h-5 w-5 mr-2" />
        {filtersVisible ? 'Ocultar Filtros e Lista Detalhada' : 'Mostrar Filtros e Lista Detalhada de Etiquetas'}
      </button>

      {filtersVisible && (
        <div id="filter-panel" className="mt-6">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-md mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">Filtrar Etiquetas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Produto" name="produto" value={activeFilters.produto || ''} onChange={handleFilterInputChange} placeholder="Nome do produto" />
              <InputField label="Fornecedor / Marca" name="fornecedor" value={activeFilters.fornecedor || ''} onChange={handleFilterInputChange} placeholder="Nome do fornecedor/marca" />
              
              <SelectField label="Responsável" name="responsavel" value={activeFilters.responsavel || EMPTY_SELECT_VALUE} onChange={handleFilterSelectChange} options={responsibleOptions} />
              <SelectField label="Tipo de Produto" name="tipoProduto" value={activeFilters.tipoProduto || EMPTY_SELECT_VALUE} onChange={handleFilterSelectChange} options={productTypeOptions} />
              <SelectField label="Tipo de Conservação" name="tipoConservacao" value={activeFilters.tipoConservacao || EMPTY_SELECT_VALUE} onChange={handleFilterSelectChange} options={conservationTypeOptions} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Manipulação (De)" name="dataManipulacaoDe" type="date" value={activeFilters.dataManipulacaoDe || ''} onChange={handleFilterInputChange} />
                <InputField label="Manipulação (Até)" name="dataManipulacaoAte" type="date" value={activeFilters.dataManipulacaoAte || ''} onChange={handleFilterInputChange} />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Validade (De)" name="validadeDe" type="date" value={activeFilters.validadeDe || ''} onChange={handleFilterInputChange} />
                <InputField label="Validade (Até)" name="validadeAte" type="date" value={activeFilters.validadeAte || ''} onChange={handleFilterInputChange} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={applyFiltersAndSort} className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm">Aplicar Filtros</button>
              <button onClick={handleClearFilters} className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-sm">Limpar Filtros</button>
            </div>
          </div>
          
          <div className="mb-4 pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-orange-700 mb-2">Ordenar Etiquetas Por:</h3>
            <div className="flex flex-wrap gap-2">
                {sortOptions.map(option => (
                    <button
                        key={option.label}
                        onClick={() => setActiveSortConfig(option)}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors
                            ${activeSortConfig.label === option.label 
                                ? 'bg-orange-500 text-white focus:ring-orange-400' 
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-orange-700 mb-4">
            Etiquetas Encontradas ({filteredDisplayLabels.length})
          </h3>
          {filteredDisplayLabels.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Nenhuma etiqueta encontrada com os filtros e ordenação atuais.</p>
          ) : (
            <ul className="space-y-3">
              {filteredDisplayLabels.map(label => (
                <li key={label.id} className="p-4 bg-slate-100 rounded-xl shadow border border-slate-200">
                  <p className="font-semibold text-slate-800">{label.produto}</p>
                  <div className="text-xs text-slate-600 mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <span><span className="font-medium">Validade:</span> {formatDateForDisplay(label.validade)}</span>
                    <span><span className="font-medium">Manip.:</span> {formatDateForDisplay(label.dataManipulacao)}</span>
                    <span><span className="font-medium">Resp.:</span> {getResponsibleName(label.responsavel)}</span>
                    <span><span className="font-medium">Tipo Prod.:</span> {getProductTypeName(label.tipoProduto)}</span>
                    <span><span className="font-medium">Conserv.:</span> {getConservationTypeName(label.tipoConservacao)}</span>
                    {label.fornecedor && <span><span className="font-medium">Forn. / Marca:</span> {label.fornecedor}</span>}
                    <span><span className="font-medium">Gerada:</span> {formatDateForDisplay(label.submissionDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidityMonitorView;