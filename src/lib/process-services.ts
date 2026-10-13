export type ProcessService = {
  id: string
  code: string
  name: string
  category: string
  description: string
  application: string
  frequency: string
  estimatedTime: string
  source: string
  steps: string[]
}

export const processServices: ProcessService[] = [
  {
    id: 'conciliacao-bancaria', code: 'FIN-001', name: 'Conciliação bancária', category: 'Financeiro',
    description: 'Conferência dos lançamentos registrados no sistema com as movimentações efetivas das contas bancárias.',
    application: 'Aplicado ao fechamento financeiro para identificar divergências, lançamentos duplicados ou valores ainda não contabilizados.',
    frequency: 'Diária', estimatedTime: '30–45 min', source: 'Manual financeiro · Out/2026',
    steps: ['Exportar o extrato bancário do período analisado.', 'Comparar cada movimentação com os lançamentos financeiros.', 'Classificar tarifas, juros e recebimentos ainda não identificados.', 'Corrigir ou registrar as divergências encontradas.', 'Validar o saldo final e registrar a conclusão da conciliação.'],
  },
  {
    id: 'contas-a-pagar', code: 'FIN-002', name: 'Gestão de contas a pagar', category: 'Financeiro',
    description: 'Organização, validação e programação das obrigações financeiras da empresa.',
    application: 'Garante que os pagamentos sejam realizados no prazo, com aprovação e documentação adequadas.',
    frequency: 'Diária', estimatedTime: '45–60 min', source: 'Manual financeiro · Out/2026',
    steps: ['Receber e conferir documentos de cobrança.', 'Validar fornecedor, valor, vencimento e centro de custo.', 'Encaminhar o pagamento para aprovação.', 'Programar o pagamento no banco.', 'Anexar o comprovante e baixar o título no sistema.'],
  },
  {
    id: 'contas-a-receber', code: 'FIN-003', name: 'Gestão de contas a receber', category: 'Financeiro',
    description: 'Acompanhamento dos títulos emitidos e dos valores esperados de clientes.',
    application: 'Utilizado para manter previsibilidade de caixa e agir rapidamente sobre atrasos.',
    frequency: 'Diária', estimatedTime: '30 min', source: 'Manual financeiro · Out/2026',
    steps: ['Conferir os títulos com vencimento próximo.', 'Identificar recebimentos no extrato bancário.', 'Realizar a baixa dos títulos liquidados.', 'Atualizar previsões de títulos renegociados.', 'Acionar a régua de cobrança para valores vencidos.'],
  },
  {
    id: 'emissao-nota-fiscal', code: 'FIS-001', name: 'Emissão de nota fiscal de serviço', category: 'Fiscal',
    description: 'Emissão e envio do documento fiscal referente aos serviços prestados ao cliente.',
    application: 'Executado após a confirmação da entrega ou conforme o marco de faturamento do contrato.',
    frequency: 'Sob demanda', estimatedTime: '15 min', source: 'Procedimento fiscal · Set/2026',
    steps: ['Confirmar os dados cadastrais e fiscais do cliente.', 'Validar o serviço, valor e competência do faturamento.', 'Emitir a nota no portal municipal.', 'Conferir impostos e informações complementares.', 'Enviar a nota ao cliente e arquivar o documento.'],
  },
  {
    id: 'fechamento-mensal', code: 'FIN-004', name: 'Fechamento financeiro mensal', category: 'Financeiro',
    description: 'Consolidação das movimentações financeiras para análise dos resultados do período.',
    application: 'Gera uma visão confiável da operação e prepara os dados para relatórios gerenciais.',
    frequency: 'Mensal', estimatedTime: '4–6 h', source: 'Manual financeiro · Out/2026',
    steps: ['Concluir todas as conciliações bancárias.', 'Validar contas a pagar e receber em aberto.', 'Conferir classificações e centros de custo.', 'Analisar divergências em relação ao orçamento.', 'Emitir o demonstrativo e compartilhar com a gestão.'],
  },
  {
    id: 'cadastro-fornecedor', code: 'CAD-001', name: 'Cadastro de fornecedor', category: 'Cadastros',
    description: 'Registro e validação das informações necessárias para contratar e pagar um fornecedor.',
    application: 'Aplicado antes da primeira contratação ou movimentação financeira com o fornecedor.',
    frequency: 'Sob demanda', estimatedTime: '20 min', source: 'Política de fornecedores · Ago/2026',
    steps: ['Solicitar documentos cadastrais e bancários.', 'Validar CNPJ e situação cadastral.', 'Conferir dados bancários com o responsável.', 'Registrar o fornecedor no sistema.', 'Anexar documentos e liberar o cadastro para uso.'],
  },
]

export const serviceCategories = ['Todos', ...Array.from(new Set(processServices.map((service) => service.category)))]
