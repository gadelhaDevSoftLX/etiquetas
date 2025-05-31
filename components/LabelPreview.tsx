
import React from 'react';
import { LabelData, EMPTY_SELECT_VALUE } from '../types'; 

interface LabelPreviewProps {
  data: LabelData;
  // responsiblesList, productTypesList, conservationTypesList are no longer needed
  // as LabelData now directly contains the names for these fields.
}

const LabelPreview: React.FC<LabelPreviewProps> = ({ data }) => {

  const isDataEffectivelyEmpty = () => {
    return !data.produto &&
           (!data.tipoProduto || data.tipoProduto === EMPTY_SELECT_VALUE) &&
           (!data.tipoConservacao || data.tipoConservacao === EMPTY_SELECT_VALUE) &&
           !data.dataManipulacao &&
           !data.validade &&
           !data.fornecedor &&
           (!data.responsavel || data.responsavel === EMPTY_SELECT_VALUE);
  };

  if (isDataEffectivelyEmpty()) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
        // Ensure UTC interpretation to avoid timezone shifts if date is just YYYY-MM-DD
        const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
         if (isNaN(date.getTime())) return "Data Inválida";
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    }
    return "Data Inválida";
  };

  // Directly use names from data object
  const tipoProdutoLabel = data.tipoProduto === EMPTY_SELECT_VALUE ? "" : data.tipoProduto;
  const conservacaoLabel = data.tipoConservacao === EMPTY_SELECT_VALUE ? "" : data.tipoConservacao;
  const responsavelName = data.responsavel === EMPTY_SELECT_VALUE ? "" : data.responsavel;

  const dataManipulacaoFormatted = formatDate(data.dataManipulacao);
  const validadeFormatted = formatDate(data.validade);
  

  return (
    <div className="mt-8 p-4 border border-orange-300 rounded-xl shadow-sm bg-orange-50 print:shadow-none print:border-black print:bg-white print:text-black">
      <h3 className="text-lg font-semibold mb-3 text-orange-700 border-b border-orange-200 pb-2 print:text-black print:border-black">
        Pré-visualização da Etiqueta
      </h3>
      <div className="space-y-2 text-sm text-slate-700 print:text-black">
        {data.produto && <PreviewItem label="Produto" value={data.produto} />}
        {tipoProdutoLabel && <PreviewItem label="Tipo de Produto" value={tipoProdutoLabel} />}
        {conservacaoLabel && <PreviewItem label="Tipo de Conservação" value={conservacaoLabel} />}
        
        {(dataManipulacaoFormatted || validadeFormatted) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
            {dataManipulacaoFormatted && <PreviewItem label="Data da Manipulação" value={dataManipulacaoFormatted} />}
            {validadeFormatted && <PreviewItem label="Validade" value={validadeFormatted} />}
          </div>
        )}
        
        {data.fornecedor && <PreviewItem label="Fornecedor / Marca" value={data.fornecedor} />} 
        {responsavelName && <PreviewItem label="Responsável" value={responsavelName} />}
      </div>
    </div>
  );
};

interface PreviewItemProps {
  label: string;
  value?: string | null;
}

const PreviewItem: React.FC<PreviewItemProps> = ({ label, value }) => {
  if (!value) return null; 
  return (
    <p>
      <span className="font-medium text-orange-800 print:text-black">{label}:</span> {value}
    </p>
  );
};

export default LabelPreview;