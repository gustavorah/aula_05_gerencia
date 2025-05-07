import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../src/app/register/page";

// Mock do App Router do Next.js
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// ✅ Mock global de fetch
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: "Registro feito com sucesso" }),
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("Register", () => {
  it("should show error message on wrong email", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Teste" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "emailerrado" },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha123" },
    });

    fireEvent.change(screen.getByLabelText("Confirmar Senha"), {
      target: { value: "senha123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));

    const errorMessage = await screen.findByText("Email inválido");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show error message on empty fields", async () => {
    render(<Register />);

    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));

    const errorMessage = await screen.findByText(
      "Todos os campos são obrigatórios"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show error message on password mismatch", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Teste" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "teste@teste.com" },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha123" },
    });

    fireEvent.change(screen.getByLabelText("Confirmar Senha"), {
      target: { value: "senhaerrada" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));

    const errorMessage = await screen.findByText("As senhas não coincidem");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show success message on successful registration", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Teste" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "teste@teste.com" },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha123" },
    });

    fireEvent.change(screen.getByLabelText("Confirmar Senha"), {
      target: { value: "senha123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));

    const successMessage = await screen.findByText(
      "Registro concluído com sucesso! Redirecionando para o login..."
    );
    expect(successMessage).toBeInTheDocument();
  });
});
