"use client";
import { useEffect, useState, useRef } from "react";
import useReactToPdf from "react-to-pdf";

// Corrected interface to match our API and database schema
interface Tarefa {
  id: number;
  descricao: string;
  data_criacao: string;
  data_previsao: string;
  data_encerramento: string | null;
  situacao: boolean;
}

// Interface for creating a new task
interface NovaTarefa {
  descricao: string;
  data_previsao: string | null;
  data_encerramento?: string | null;
  situacao: boolean;
}

// Default empty task for the form
const emptyTask: NovaTarefa = {
  descricao: "",
  data_previsao: null,
  data_encerramento: null,
  situacao: false,
};

export default function TarefaView() {
  // State for tasks list
  const [tarefas, setTarefas] = useState<Array<Tarefa>>([]);
  // State for the current task being edited
  const [currentTask, setCurrentTask] = useState<NovaTarefa>({ ...emptyTask });
  // State to track if we're editing or creating
  const [editingId, setEditingId] = useState<number | null>(null);
  // State for feedback messages
  const [feedback, setFeedback] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  // State for form visibility
  const [showForm, setShowForm] = useState<boolean>(false);

  // State for export modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // State for filters
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "",
    search: "",
  });

  // State for PDF export
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  // Ref for the PDF container
  const pdfRef = useRef<HTMLDivElement>(null);

  // Function to fetch all tasks with optional filters
  const getTarefas = async (filterParams = {}) => {
    try {
      // Build query string from filter parameters
      const queryParams = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const queryString = queryParams.toString();
      const url = queryString ? `/api/tarefas?${queryString}` : "/api/tarefas";

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Falha ao carregar tarefas");
      }
      return response.json();
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      showFeedback("Erro ao carregar tarefas", true);
      return [];
    }
  };

  // Function to create a new task
  const createTarefa = async (tarefa: NovaTarefa) => {
    try {
      const response = await fetch("/api/tarefas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tarefa),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar tarefa");
      }

      const newTask = await response.json();
      setTarefas([...tarefas, newTask]);
      resetForm();
      showFeedback("Tarefa criada com sucesso!", false);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      showFeedback(
        `Erro ao criar tarefa: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        true
      );
    }
  };

  const normalizeTarefa = (tarefa: NovaTarefa): NovaTarefa => {
    return {
      ...tarefa,
      data_previsao: tarefa.data_previsao === "" ? null : tarefa.data_previsao,
      data_encerramento:
        tarefa.data_encerramento === "" ? null : tarefa.data_encerramento,
    };
  };

  // Function to update an existing task
  const updateTarefa = async (id: number, tarefa: NovaTarefa) => {
    console.log("Atualizando tarefa:", id, JSON.stringify(tarefa));
    try {
      tarefa = normalizeTarefa(tarefa); // Normalize the task before sending it to the server
      console.log("Tarefa normalizada:", tarefa);
      const response = await fetch(`/api/tarefas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tarefa),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar tarefa");
      }

      const updatedTask = await response.json();
      setTarefas(tarefas.map((t) => (t.id === id ? updatedTask : t)));
      resetForm();
      showFeedback("Tarefa atualizada com sucesso!", false);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      showFeedback(
        `Erro ao atualizar tarefa: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        true
      );
    }
  };

  // Function to delete a task
  const deleteTarefa = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tarefas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao excluir tarefa");
      }

      setTarefas(tarefas.filter((t) => t.id !== id));
      showFeedback("Tarefa excluída com sucesso!", false);
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      showFeedback(
        `Erro ao excluir tarefa: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        true
      );
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTask.descricao.trim()) {
      showFeedback("A descrição é obrigatória", true);
      return;
    }

    if (editingId) {
      updateTarefa(editingId, currentTask);
    } else {
      createTarefa(currentTask);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentTask((prev) => ({ ...prev, [name]: checked }));
    } else {
      setCurrentTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Function to start editing a task
  const startEditing = (tarefa: Tarefa) => {
    setCurrentTask({
      descricao: tarefa.descricao,
      data_previsao: formatDateForInput(tarefa.data_previsao),
      data_encerramento: tarefa.data_encerramento
        ? formatDateForInput(tarefa.data_encerramento)
        : null,
      situacao: tarefa.situacao,
    });
    setEditingId(tarefa.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper function to format date string for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Não definida";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  // Helper function to format date for input fields
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
    } catch (error) {
      console.error("Erro ao formatar data para input:", error);
      return "";
    }
  };

  // Helper function to toggle task status
  const toggleStatus = async (tarefa: Tarefa) => {
    try {
      const updatedTask = { ...tarefa, situacao: !tarefa.situacao };

      const response = await fetch(`/api/tarefas/${tarefa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ situacao: !tarefa.situacao }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar situação");
      }

      const result = await response.json();
      setTarefas(tarefas.map((t) => (t.id === tarefa.id ? result : t)));
      showFeedback("Situação atualizada!", false);
    } catch (error) {
      console.error("Erro ao atualizar situação:", error);
      showFeedback("Erro ao atualizar situação", true);
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setCurrentTask({ ...emptyTask });
    setEditingId(null);
    setShowForm(false);
  };

  // Function to show feedback messages
  const showFeedback = (message: string, isError: boolean) => {
    setFeedback({ message, isError });
    // Auto-hide feedback after 5 seconds
    setTimeout(() => setFeedback(null), 5000);
  };

  // Function to handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to apply filters
  const applyFilters = async () => {
    const tasks = await getTarefas(filters);
    setTarefas(tasks);
  };

  // Function to reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      status: "",
      search: "",
    });

    // Reload all tasks
    getTarefas().then((response) => {
      setTarefas(response);
    });
  };

  // Function to handle PDF export
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query string from filter parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/tarefas/export?${queryString}`
        : "/api/tarefas/export";

      // Open the export URL in a new window
      const exportWindow = window.open(url, "_blank");

      if (!exportWindow) {
        throw new Error("Pop-up bloqueado pelo navegador");
      }

      showFeedback("PDF gerado com sucesso!", false);
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      showFeedback(
        `Erro ao exportar para PDF: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        true
      );
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  // Load tasks when component mounts
  useEffect(() => {
    getTarefas().then((response) => {
      setTarefas(response);
    });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Gerenciador de Tarefas</h1>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showForm ? "Cancelar" : "Nova Tarefa"}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exportando...
              </>
            ) : (
              "Exportar PDF"
            )}
          </button>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-4 mb-4 rounded ${
            feedback.isError
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Form for creating/editing tasks */}
      {showForm && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="descricao"
              >
                Descrição:
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={currentTask.descricao}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="data_previsao"
                >
                  Data de Previsão:
                </label>
                <input
                  type="datetime-local"
                  id="data_previsao"
                  name="data_previsao"
                  value={currentTask.data_previsao}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="data_encerramento"
                >
                  Data de Encerramento:
                </label>
                <input
                  type="datetime-local"
                  id="data_encerramento"
                  name="data_encerramento"
                  value={currentTask.data_encerramento || ""}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="situacao"
                  checked={currentTask.situacao}
                  onChange={handleInputChange}
                  className="mr-2 form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700 font-bold">Concluída</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {editingId ? "Atualizar" : "Criar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter controls */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-end space-y-2 md:space-y-0 md:space-x-4 mb-2">
          <div className="w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-1"
              htmlFor="search"
            >
              Pesquisar
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Pesquisar por descrição"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-1"
              htmlFor="status"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              <option value="true">Concluídas</option>
              <option value="false">Em aberto</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end space-y-2 md:space-y-0 md:space-x-4 mb-4">
          <div className="w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-1"
              htmlFor="dateFrom"
            >
              Data Inicial
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-1"
              htmlFor="dateTo"
            >
              Data Final
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={resetFilters}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Limpar
          </button>
          <button
            onClick={applyFilters}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Exportar Lista de Tarefas
            </h3>

            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                Configure as opções de exportação:
              </p>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="exportStatus"
                >
                  Status das Tarefas
                </label>
                <select
                  id="exportStatus"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Todas as tarefas</option>
                  <option value="true">Apenas concluídas</option>
                  <option value="false">Apenas em aberto</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="exportDateFrom"
                  >
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    id="exportDateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="exportDateTo"
                  >
                    Data Final
                  </label>
                  <input
                    type="date"
                    id="exportDateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="exportSearch"
                >
                  Pesquisa por Descrição
                </label>
                <input
                  type="text"
                  id="exportSearch"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por descrição"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                disabled={isExporting}
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Gerando PDF...
                  </>
                ) : (
                  "Exportar PDF"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Lista de Tarefas</h2>

        {tarefas.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          tarefas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{tarefa.descricao}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(tarefa)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteTarefa(tarefa.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    title="Excluir"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Criação:</span>{" "}
                    {formatDate(tarefa.data_criacao)}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Previsão:</span>{" "}
                    {formatDate(tarefa.data_previsao)}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">
                      Encerramento:
                    </span>{" "}
                    {tarefa.data_encerramento
                      ? formatDate(tarefa.data_encerramento)
                      : "Não encerrada"}
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700 font-bold">
                      Status:
                    </span>
                    <button
                      onClick={() => toggleStatus(tarefa)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tarefa.situacao
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tarefa.situacao ? "Concluída" : "Em aberto"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
