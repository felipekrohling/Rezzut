import React, { useState, useEffect } from 'react';
import { Proposal, Supplier } from '../types';

interface ProposalFormProps {
  requestId: string;
  suppliers: Supplier[];
  onAdd: (proposal: Proposal) => void;
  onCancel: () => void;
  initialData?: Proposal;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ requestId, suppliers, onAdd, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Proposal>>({
    currency: 'BRL',
    supplierName: '',
    price: 0,
    deliveryDays: 0,
    deliveryDate: '',
    paymentTerms: '',
    technicalSpecs: '',
    validityDate: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProposal: Proposal = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      supplierName: formData.supplierName || 'Fornecedor Desconhecido',
      price: Number(formData.price),
      currency: formData.currency || 'BRL',
      deliveryDays: Number(formData.deliveryDays),
      deliveryDate: formData.deliveryDate || undefined,
      paymentTerms: formData.paymentTerms || 'A vista',
      technicalSpecs: formData.technicalSpecs || '',
      validityDate: formData.validityDate || new Date().toISOString().split('T')[0]
    };
    onAdd(newProposal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        {initialData ? 'Editar Proposta' : 'Nova Proposta de Fornecedor'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Fornecedor</label>
            <input
              required
              name="supplierName"
              type="text"
              list="suppliers-list"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Selecione ou digite o nome..."
              value={formData.supplierName}
              onChange={handleChange}
              autoComplete="off"
            />
            <datalist id="suppliers-list">
              {suppliers.map(s => (
                <option key={s.id} value={s.name}>{s.category}</option>
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Total</label>
            <div className="flex">
              <select 
                name="currency" 
                value={formData.currency} 
                onChange={handleChange}
                className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600"
              >
                <option value="BRL">R$</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input
                required
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo em Dias</label>
            <input
              required
              name="deliveryDays"
              type="number"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 15"
              value={formData.deliveryDays}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Entrega Prevista</label>
             <input
              name="deliveryDate"
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.deliveryDate || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condições de Pagamento</label>
            <input
              required
              name="paymentTerms"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 30/60/90 dias"
              value={formData.paymentTerms}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Validade da Proposta</label>
          <input
            required
            name="validityDate"
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.validityDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especificações Técnicas Ofertadas</label>
          <textarea
            required
            name="technicalSpecs"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o que está sendo ofertado, marca, modelo, etc..."
            value={formData.technicalSpecs}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
          >
            {initialData ? 'Salvar Alterações' : 'Adicionar Proposta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;