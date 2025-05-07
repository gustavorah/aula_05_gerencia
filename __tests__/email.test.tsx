import "@testing-library/jest-dom";
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { sendTestEmail } from "@/src/lib/email";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("Email", () => {
  const sendMailMock = jest.fn();

  beforeEach(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve enviar um email com sucesso", async () => {
    sendMailMock.mockResolvedValueOnce(true);
    const result = await sendTestEmail("gustavo.rahmeier@universo.univates.br");
    expect(sendMailMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("deve falhar ao enviar um email", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("Falha no envio"));
    const result = await sendTestEmail("invalid-email");
    expect(sendMailMock).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("deve enviar um email com os dados corretos", async () => {
    sendMailMock.mockResolvedValueOnce(true);

    await sendTestEmail("teste@dominio.com");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "teste@dominio.com",
        subject: expect.stringContaining("Test Email"),
        html: expect.stringContaining("<h1>Test Email</h1>"),
      })
    );
  });
});
