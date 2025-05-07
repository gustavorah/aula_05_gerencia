import "@testing-library/jest-dom";
import { signIn } from "next-auth/react";

// Mock da função signIn
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("Login", () => {
  it("should show an error message on invalid credentials", async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      error: "Invalid credentials",
    });

    const result = await signIn("credentials", {
      redirect: false,
      email: "teste@teste.com",
      password: "senhaerrada",
      callbackUrl: "/",
    });

    expect(result?.error).toBe("Invalid credentials");
  });

  it("should redirect to the dashboard on successful login", async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      ok: true,
      url: "/",
    });

    const result = await signIn("credentials", {
      redirect: false,
      email: "teste@teste.com",
      password: "senha123",
      callbackUrl: "/",
    });

    expect(result?.ok).toBe(true);
    expect(result?.url).toBe("/");
  });
});
