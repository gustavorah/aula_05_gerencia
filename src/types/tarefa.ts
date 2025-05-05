// Task-related interfaces
export interface Tarefa {
  id: number;
  descricao: string;
  data_criacao: string;
  data_previsao: string;
  data_encerramento: string | null;
  situacao: boolean;
  usuario_id?: number;
}

// Input interfaces for creating/updating tasks
export interface TarefaInput {
  descricao: string;
  data_previsao?: string;
  data_encerramento?: string | null;
  situacao?: boolean;
  usuario_id?: number;
}

// User-related interfaces
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string; // Only included when needed, omitted in responses
  data_criacao: string;
  data_atualizacao: string;
  ultimo_login: string | null;
  ativo: boolean;
}

export interface UserSession {
  id: number | string;
  name: string;
  email: string;
}

// Filter options for tasks
export interface TaskFilterOptions {
  dateFrom?: string;
  dateTo?: string;
  status?: boolean | string;
  searchTerm?: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

