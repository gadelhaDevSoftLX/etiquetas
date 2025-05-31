

import React, { useState, useCallback, useEffect } from 'react';
import { LabelData, ManagedResponsible, ManagedProductType, ManagedConservationType, ManagedItemEntry, PRODUCT_TYPE_OTHER_NAME, EMPTY_SELECT_VALUE, StoredLabelData } from '../types';
import InputField from './InputField';
// SelectField is no longer used here directly, but InputField is.
import LabelPreview from './LabelPreview';
import SpinnerIcon from './icons/SpinnerIcon';
import { supabase } from '../supabaseClient'; // Import Supabase client

const N8N_WEBHOOK_URL_PLACEHOLDER = 'https://your-n8n-instance.com/webhook/your-webhook-id';
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/your-webhook-id'; // User should replace this
const DEFAULT_N8N_WEBHOOK_URL_DISPLAY = 'YOUR_N8N_WEBHOOK_URL_HERE';
const SUPABASE_LABELS_TABLE = 'generated_labels'; // Define your Supabase table name

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialLabelData: LabelData = {
  produto: '',
  dataManipulacao: getTodayDateString(), 
  validade: '',
  responsavel: EMPTY_SELECT_VALUE,      // Will store name
  tipoConservacao: EMPTY_SELECT_VALUE, // Will store name
  tipoProduto: EMPTY_SELECT_VALUE,     // Will store name
  fornecedor: '',
};

type LabelFormErrors = Partial<Record<keyof LabelData, string>>;

interface LabelGeneratorViewProps {
  responsiblesList: ManagedResponsible[];
  productTypesList: ManagedProductType[];
  conservationTypesList: ManagedConservationType[];
  itemsList: ManagedItemEntry[];
  onAddGeneratedLabel: (label: LabelData) => void; // This still handles localStorage update
}

const LabelGeneratorView: React.FC<LabelGeneratorViewProps> = ({ 
  responsiblesList,
  productTypesList,
  conservationTypesList,
  itemsList,
  onAddGeneratedLabel
}) => {
  const [labelData, setLabelData] = useState<LabelData>(initialLabelData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidadeAuto, setIsValidadeAuto] = useState<boolean>(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<LabelData | null>(null);
  const [errors, setErrors] = useState<LabelFormErrors>({});

  const validateForm = (data: LabelData): boolean => {
    const currentErrors: LabelFormErrors = {};

    if (!data.produto.trim()) {
      currentErrors.produto = "Produto (Nome) é obrigatório.";
    }
    if (data.tipoProduto === EMPTY_SELECT_VALUE) {
      currentErrors.tipoProduto = "Tipo de Produto é obrigatório.";
    }
    if (data.tipoConservacao === EMPTY_SELECT_VALUE) {
      currentErrors.tipoConservacao = "Tipo de Conservação é obrigatório.";
    }

    const dManipulacaoStr = data.dataManipulacao;
    let dManipulacaoDate: Date | null = null;
    if (!dManipulacaoStr) {
      currentErrors.dataManipulacao = "Data da Manipulação é obrigatória.";
    } else {
      dManipulacaoDate = new Date(dManipulacaoStr + 'T00:00:00Z'); // Assume local date, interpret as UTC midnight
      if (isNaN(dManipulacaoDate.getTime())) {
        currentErrors.dataManipulacao = "Data da Manipulação inválida.";
        dManipulacaoDate = null; // Ensure it's not used if invalid
      }
    }

    const dValidadeStr = data.validade;
    let dValidadeDate: Date | null = null;
    if (!dValidadeStr) {
      currentErrors.validade = "Validade é obrigatória.";
    } else {
      dValidadeDate = new Date(dValidadeStr + 'T00:00:00Z'); // Assume local date, interpret as UTC midnight
      if (isNaN(dValidadeDate.getTime())) {
        currentErrors.validade = "Data de Validade inválida.";
        dValidadeDate = null;
      }
    }

    if (dManipulacaoDate && dValidadeDate && dValidadeDate < dManipulacaoDate) {
      currentErrors.validade = "Validade não pode ser anterior à Data da Manipulação.";
    }
    
    if (data.responsavel === EMPTY_SELECT_VALUE) {
      currentErrors.responsavel = "Responsável é obrigatório.";
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setLabelData(prevData => {
      const newData = { ...prevData, [name]: value };

      if (name === 'produto') {
        const matchedItem = itemsList.find(item => item.name === value);
        if (matchedItem && matchedItem.productTypeId) {
          const productTypeName = productTypesList.find(pt => pt.id === matchedItem.productTypeId)?.name;
          if (productTypeName) {
            newData.tipoProduto = productTypeName; // Set the name
          } else {
            newData.tipoProduto = EMPTY_SELECT_VALUE; 
          }
        }
      }
      return newData;
    });

    if (errors[name as keyof LabelData]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name as keyof LabelData];
        return newErrors;
      });
    }

    if (name === 'validade' && isValidadeAuto) {
        setIsValidadeAuto(false);
    }

  }, [isValidadeAuto, itemsList, productTypesList, errors]);


  useEffect(() => {
    const { dataManipulacao, tipoProduto, tipoConservacao } = labelData;
    let newIsValidadeAuto = false;
    let calculatedValidade = labelData.validade;

    if (tipoProduto === PRODUCT_TYPE_OTHER_NAME) { 
        newIsValidadeAuto = false; 
    } else if (dataManipulacao && tipoConservacao && tipoConservacao !== EMPTY_SELECT_VALUE) {
      const manipulacaoDateObj = new Date(dataManipulacao + 'T00:00:00Z'); // Interpret as UTC
      const selectedConservationType = conservationTypesList.find(ct => ct.name === tipoConservacao);

      if (!isNaN(manipulacaoDateObj.getTime()) && selectedConservationType && selectedConservationType.validityDays !== undefined) {
        const ruleDays = Number(selectedConservationType.validityDays);
        if (!isNaN(ruleDays)) {
            const validadeDate = new Date(manipulacaoDateObj);
            validadeDate.setUTCDate(manipulacaoDateObj.getUTCDate() + ruleDays); // Use UTC date methods
            calculatedValidade = validadeDate.toISOString().split('T')[0];
            newIsValidadeAuto = true;
        } else {
            newIsValidadeAuto = false; 
        }
      } else {
        newIsValidadeAuto = false; 
      }
    } else {
      newIsValidadeAuto = false; 
    }
    
    if (!newIsValidadeAuto && isValidadeAuto && tipoProduto !== PRODUCT_TYPE_OTHER_NAME && tipoConservacao !== EMPTY_SELECT_VALUE) {
        if (!dataManipulacao || !tipoConservacao || tipoConservacao === EMPTY_SELECT_VALUE) {
             calculatedValidade = ''; 
        }
    }

    if (calculatedValidade !== labelData.validade || newIsValidadeAuto !== isValidadeAuto) {
         setLabelData(prev => ({ ...prev, validade: calculatedValidade }));
    }
    setIsValidadeAuto(newIsValidadeAuto);

  }, [labelData.dataManipulacao, labelData.tipoProduto, labelData.tipoConservacao, labelData.validade, isValidadeAuto, conservationTypesList]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setErrors({}); // Clear previous errors

    if (!validateForm(labelData)) {
      setIsLoading(false);
      // Optionally set a general message about validation errors
      // setMessage({ type: 'error', text: 'Por favor, corrija os erros no formulário.' });
      return;
    }
    
    setIsLoading(true);

    let n8nSuccess = true;
    let n8nMessage = '';

    if (N8N_WEBHOOK_URL !== N8N_WEBHOOK_URL_PLACEHOLDER) {
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify(labelData),
        });

        if (!response.ok) {
          let errorMsg = `Erro N8N: ${response.statusText} (${response.status}).`;
          try { 
            const errorData = await response.json(); 
            errorMsg = errorData.message || errorMsg; 
          } catch (parseError) { /* Do nothing */ }
          throw new Error(errorMsg);
        }
        n8nMessage = 'Enviada para N8N. ';
      } catch (error) {
        n8nSuccess = false;
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido no N8N.';
        n8nMessage = `Falha N8N: ${errorMessage}. `;
        console.error('N8N submission error:', error);
      }
    } else {
      n8nMessage = 'N8N não configurado. ';
    }

    onAddGeneratedLabel(labelData); 
    
    let supabaseSuccess = false;
    let supabaseMessage = '';

    if (supabase) { 
      const newStoredLabel: StoredLabelData = {
        ...labelData,
        id: crypto.randomUUID(), 
        submissionDate: new Date().toISOString(),
      };

      try {
        const { error: supabaseError } = await supabase
          .from(SUPABASE_LABELS_TABLE)
          .insert(newStoredLabel); 

        if (supabaseError) {
          throw supabaseError;
        }
        supabaseSuccess = true;
        supabaseMessage = 'Salva no banco de dados!';
      } catch (error) {
        const sbError = error as any;
        supabaseMessage = `Erro Supabase: ${sbError.message || 'Desconhecido'}.`;
        console.error('Supabase insert error:', error);
      }
    } else {
      supabaseMessage = 'Supabase não configurado.';
    }

    if (n8nSuccess && supabaseSuccess) {
      setMessage({ type: 'success', text: `Sucesso! ${n8nMessage}${supabaseMessage}` });
      setLastSubmittedData(labelData); 
      setLabelData({...initialLabelData, dataManipulacao: getTodayDateString()}); 
      setIsValidadeAuto(false);
      setErrors({}); // Clear errors on full success
    } else {
      setMessage({ type: 'error', text: `Concluído com problemas: ${n8nMessage}${supabaseMessage}` });
    }
    setIsLoading(false);
  };

  const handleLoadLastData = () => {
    if (lastSubmittedData) {
      setLabelData(lastSubmittedData);
      setErrors({}); // Clear errors when loading last data
      const { dataManipulacao, tipoProduto, tipoConservacao } = lastSubmittedData;
      if (dataManipulacao && tipoConservacao && tipoConservacao !== EMPTY_SELECT_VALUE && tipoProduto !== PRODUCT_TYPE_OTHER_NAME) {
          const selectedConservationType = conservationTypesList.find(ct => ct.name === tipoConservacao);
          if (selectedConservationType && selectedConservationType.validityDays !== undefined) {
              setIsValidadeAuto(true);
          } else {
              setIsValidadeAuto(false);
          }
      } else {
          setIsValidadeAuto(false);
      }
      setMessage({ type: 'success', text: 'Dados da última etiqueta carregados.' });
    } else {
      setMessage({ type: 'error', text: 'Nenhuma etiqueta anterior salva para carregar.' });
    }
  };
  
  const registeredProductsDatalistId = "registered-products-list";
  const responsiblesDatalistId = "responsibles-list";
  const productTypesDatalistId = "product-types-list";
  const conservationTypesDatalistId = "conservation-types-list";

  return (
    <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-6 md:p-8 mt-4 md:mt-6 print:shadow-none print:mt-0">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-orange-600 mb-8 print:hidden">
        Gerador de Etiqueta de Alimentos
      </h1>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`p-3 mb-4 rounded-lg text-sm border print:hidden ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-300'
              : 'bg-red-50 text-red-700 border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <InputField
            label="Produto (Nome)"
            name="produto"
            value={labelData.produto}
            onChange={handleInputChange}
            placeholder="Digite ou selecione da lista"
            maxLength={100}
            datalistId={registeredProductsDatalistId}
          />
          {errors.produto && <p className="text-xs text-red-500 mt-1">{errors.produto}</p>}
        </div>
        <datalist id={registeredProductsDatalistId}>
            {itemsList.map(item => (
                <option key={item.id} value={item.name} />
            ))}
        </datalist>
        
        <div>
          <InputField
            label="Tipo de Produto"
            name="tipoProduto"
            value={labelData.tipoProduto}
            onChange={handleInputChange}
            placeholder="Digite ou selecione"
            datalistId={productTypesDatalistId}
          />
          {errors.tipoProduto && <p className="text-xs text-red-500 mt-1">{errors.tipoProduto}</p>}
        </div>
        <datalist id={productTypesDatalistId}>
            {productTypesList.map(pt => (
                <option key={pt.id} value={pt.name} />
            ))}
            <option value={PRODUCT_TYPE_OTHER_NAME} />
        </datalist>

        <div>
          <InputField
            label="Tipo de Conservação"
            name="tipoConservacao"
            value={labelData.tipoConservacao}
            onChange={handleInputChange}
            placeholder="Digite ou selecione"
            datalistId={conservationTypesDatalistId}
          />
          {errors.tipoConservacao && <p className="text-xs text-red-500 mt-1">{errors.tipoConservacao}</p>}
        </div>
        <datalist id={conservationTypesDatalistId}>
            {conservationTypesList.map(ct => (
                <option key={ct.id} value={ct.name} />
            ))}
        </datalist>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InputField
              label="Data da Manipulação"
              name="dataManipulacao"
              type="date"
              value={labelData.dataManipulacao}
              onChange={handleInputChange}
            />
            {errors.dataManipulacao && <p className="text-xs text-red-500 mt-1">{errors.dataManipulacao}</p>}
          </div>
          <div>
            <InputField
              label="Validade"
              name="validade"
              type="date"
              value={labelData.validade}
              onChange={handleInputChange}
              disabled={isValidadeAuto}
            />
            {errors.validade && <p className="text-xs text-red-500 mt-1">{errors.validade}</p>}
          </div>
        </div>
        
        <div>
          <InputField
            label="Fornecedor / Marca" 
            name="fornecedor"
            value={labelData.fornecedor}
            onChange={handleInputChange}
            placeholder="Ex: Distribuidora Alimentos Seguros / Marca X" 
            maxLength={70}
          />
          {/* Fornecedor is not a required field in this iteration based on prompt */}
        </div>
        
        <div>
          <InputField
            label="Responsável"
            name="responsavel"
            value={labelData.responsavel}
            onChange={handleInputChange}
            placeholder="Digite ou selecione"
            datalistId={responsiblesDatalistId}
          />
          {errors.responsavel && <p className="text-xs text-red-500 mt-1">{errors.responsavel}</p>}
        </div>
        <datalist id={responsiblesDatalistId}>
            {responsiblesList.map(r => (
                <option key={r.id} value={r.name} />
            ))}
        </datalist>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-3 print:hidden">
          <button
            type="button"
            onClick={handleLoadLastData}
            disabled={!lastSubmittedData}
            className="w-full sm:w-auto px-5 py-3 bg-orange-200 hover:bg-orange-300 text-orange-700 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            Carregar Última
          </button>
          <button
            type="submit"
            disabled={isLoading || !supabase} // Simplified condition: disabled if loading OR supabase client not initialized
            className="w-full flex-grow px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
          >
            {isLoading && <SpinnerIcon className="h-5 w-5 mr-2" />}
            {isLoading ? 'Enviando...' : 'Gerar e Enviar'}
          </button>
        </div>
      </form>

      <LabelPreview 
        data={labelData} 
      />
      
      <p className="mt-8 text-xs text-center text-gray-500 print:hidden">
        Nota: Os dados serão enviados para um webhook n8n (se configurado) e para o banco de dados Supabase (se configurado) para processamento, impressão e monitoria.
        Certifique-se que o URL do webhook N8N (`${N8N_WEBHOOK_URL === N8N_WEBHOOK_URL_PLACEHOLDER ? DEFAULT_N8N_WEBHOOK_URL_DISPLAY : N8N_WEBHOOK_URL}`) está configurado em LabelGeneratorView.tsx, se aplicável.
      </p>
       { !supabase && // Simplified condition: show warning if supabase client is not initialized
         <p className="mt-2 text-xs text-center text-red-500 print:hidden">
            AVISO: Integração com Supabase não está configurada (verifique URL/Chave em supabaseClient.ts). Os dados não serão salvos no banco de dados.
        </p>
      }
    </div>
  );
};

export default LabelGeneratorView;