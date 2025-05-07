describe("Export", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === "/api/exportar" && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            message: "Exportação concluída com sucesso",
          }),
        });
      }

      return Promise.reject(new Error("URL não reconhecida"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve exportar dados com sucesso", async () => {
    const response = await fetch("/api/exportar", { method: "POST" });
    const data = await response.json();
    expect(data.message).toBe("Exportação concluída com sucesso");
  });

  it("deve falhar ao exportar dados", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Falha na exportação"))
    );

    try {
      await fetch("/api/exportar", { method: "POST" });
    } catch (error) {
      expect(error).toEqual(new Error("Falha na exportação"));
    }
  });
});
