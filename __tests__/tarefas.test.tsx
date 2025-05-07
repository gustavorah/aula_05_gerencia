import "@testing-library/jest-dom";
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TarefaView from "../src/app/page";

// Mock do useSession do NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("Tarefas", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === "/api/tarefas") {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 1,
              descricao: "Tarefa teste",
              data_criacao: new Date().toISOString(),
              data_previsao: new Date().toISOString(),
              data_encerramento: null,
              situacao: false,
            },
          ],
        });
      }

      if (url === "/api/tarefas/1" && options?.method === "DELETE") {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }

      if (url === "/api/tarefas/1" && options?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 1,
            descricao: "Tarefa teste",
            data_criacao: new Date().toISOString(),
            data_previsao: new Date().toISOString(),
            data_encerramento: null,
            situacao: true,
          }),
        });
      }

      if (url === "/api/tarefas" && options?.method === "POST") {
        const body = JSON.parse(options.body);
        if (body.data_previsao && new Date(body.data_previsao) < new Date()) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: async () => ({
              error: "Data de previsão não pode ser no passado",
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...body,
            id: 2,
            data_criacao: new Date().toISOString(),
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render the Tarefas component", async () => {
    await act(async () => {
      render(<TarefaView />);
    });
    expect(await screen.findByText("Tarefa teste")).toBeInTheDocument();
  });

  it("should show error message when creating task with empty descricao field", async () => {
    await act(async () => {
      render(<TarefaView />);
    });

    fireEvent.click(screen.getByRole("button", { name: /nova tarefa/i }));
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    expect(
      await screen.findByText("A descrição é obrigatória")
    ).toBeInTheDocument();
  });

  it("should show success message when creating task", async () => {
    await act(async () => {
      render(<TarefaView />);
    });

    fireEvent.click(screen.getByRole("button", { name: /nova tarefa/i }));
    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Nova tarefa" },
    });
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    expect(
      await screen.findByText("Tarefa criada com sucesso!")
    ).toBeInTheDocument();
  });

  it("should show error message when creating task with invalid date", async () => {
    // mock para resposta da criação com erro de data
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === "/api/tarefas" && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({
            error: "Data de previsão não pode ser no passado",
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    await act(async () => {
      render(<TarefaView />);
    });

    // Abrir o formulário
    fireEvent.click(screen.getByRole("button", { name: /nova tarefa/i }));

    // Preencher descrição
    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Tarefa inválida" },
    });

    // Preencher data passada
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 dia atrás
      .toISOString()
      .slice(0, 16); // YYYY-MM-DDTHH:MM

    fireEvent.change(screen.getByLabelText("Data de Previsão:"), {
      target: { value: yesterday },
    });

    // Submeter
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    // Verificar mensagem de erro
    const errorMessage = await screen.findByText(
      "Erro ao criar tarefa: Data de previsão não pode ser no passado"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("should reset the form when clicking Cancelar", async () => {
    await act(async () => {
      render(<TarefaView />);
    });

    fireEvent.click(screen.getByRole("button", { name: /nova tarefa/i }));
    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Texto temporário" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: /cancelar/i })[1]);
    fireEvent.click(screen.getByRole("button", { name: /nova tarefa/i }));

    expect(screen.getByLabelText("Descrição:")).toHaveValue("");
  });

  it("should toggle task status", async () => {
    await act(async () => {
      render(<TarefaView />);
    });

    const statusButton = await screen.findByRole("button", {
      name: /em aberto/i,
    });

    fireEvent.click(statusButton);

    expect(await screen.findByText(/concluída/i)).toBeInTheDocument();
  });

  it("should delete task and show confirmation", async () => {
    await act(async () => {
      render(<TarefaView />);
    });

    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    expect(
      await screen.findByText("Tarefa excluída com sucesso!")
    ).toBeInTheDocument();
  });

  it("should apply filters and show filtered task", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 2,
          descricao: "Filtrada",
          data_criacao: new Date().toISOString(),
          data_previsao: new Date().toISOString(),
          data_encerramento: null,
          situacao: true,
        },
      ],
    });

    await act(async () => {
      render(<TarefaView />);
    });

    fireEvent.change(screen.getByLabelText("Pesquisar"), {
      target: { value: "Filtrada" },
    });

    fireEvent.click(screen.getByRole("button", { name: /aplicar filtros/i }));

    expect(await screen.findByText("Filtrada")).toBeInTheDocument();
  });

  it("should show success message when updating a task", async () => {
    await act(async () => {
      render(<TarefaView />);
    });

    fireEvent.click(screen.getByRole("button", { name: /editar/i }));

    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Tarefa atualizada" },
    });

    fireEvent.click(screen.getByRole("button", { name: /atualizar/i }));

    expect(
      await screen.findByText("Tarefa atualizada com sucesso!")
    ).toBeInTheDocument();
  });
});
