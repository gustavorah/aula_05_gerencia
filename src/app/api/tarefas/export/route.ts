import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import pool from "../../../../../db";
import { UserSession } from "../../../../types/tarefa";
import puppeteer from "puppeteer";

// Helper function to get the user from the request
async function getUserFromRequest(request: NextRequest): Promise<UserSession | null> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.id || !token.email) {
      return null;
    }
    
    return {
      id: token.id as string | number,
      name: token.name as string,
      email: token.email as string
    };
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

// Generate HTML for the PDF content
function generatePdfContent(tasks: any[], userName: string) {
  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // HTML template for the PDF
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Tarefas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .header-info {
          text-align: center;
          margin-bottom: 30px;
          font-size: 14px;
          color: #6b7280;
        }
        .task-list {
          margin-top: 20px;
        }
        .task-item {
          margin-bottom: 15px;
          padding: 15px;
          border-left: 5px solid #3b82f6;
          background-color: #f9fafb;
        }
        .task-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .task-title {
          font-weight: bold;
          font-size: 16px;
          color: #111827;
          margin: 0;
        }
        .task-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
        }
        .status-complete {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-open {
          background-color: #fef3c7;
          color: #92400e;
        }
        .task-details {
          font-size: 13px;
        }
        .detail-label {
          font-weight: bold;
          color: #4b5563;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <h1>Lista de Tarefas</h1>
      <div class="header-info">
        <p>Usuário: ${userName}</p>
        <p>Data de Exportação: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Total de Tarefas: ${tasks.length}</p>
      </div>

      <div class="task-list">
        ${tasks.map(task => `
          <div class="task-item">
            <div class="task-header">
              <h3 class="task-title">${task.descricao}</h3>
              <span class="task-status ${task.situacao ? 'status-complete' : 'status-open'}">
                ${task.situacao ? 'Concluída' : 'Em aberto'}
              </span>
            </div>
            <div class="task-details">
              <p><span class="detail-label">Criação:</span> ${formatDate(task.data_criacao)}</p>
              <p><span class="detail-label">Previsão:</span> ${formatDate(task.data_previsao)}</p>
              <p><span class="detail-label">Encerramento:</span> ${task.data_encerramento ? formatDate(task.data_encerramento) : 'Não encerrada'}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Sistema de Gerenciamento de Tarefas</p>
      </div>
    </body>
    </html>
  `;
}

// GET endpoint to export tasks as PDF
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: "Não autorizado. Faça login para continuar." },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const status = url.searchParams.get("status");
    const searchTerm = url.searchParams.get("search");

    let query = "SELECT * FROM tarefa WHERE usuario_id = $1";
    const queryParams: any[] = [user.id];
    let paramCounter = 2;

    if (dateFrom) {
      query += ` AND data_criacao >= $${paramCounter++}`;
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      query += ` AND data_criacao <= $${paramCounter++}`;
      queryParams.push(dateTo);
    }

    if (status !== null && status !== undefined) {
      const statusValue = status === "true" || status === "1";
      query += ` AND situacao = $${paramCounter++}`;
      queryParams.push(statusValue);
    }

    if (searchTerm) {
      query += ` AND descricao ILIKE $${paramCounter++}`;
      queryParams.push(`%${searchTerm}%`);
    }

    query += " ORDER BY data_criacao DESC";

    const result = await pool.query(query, queryParams);
    const tasks = result.rows;

    const htmlContent = generatePdfContent(tasks, user.name);

    // Puppeteer: criar PDF a partir do HTML
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tarefas.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF de tarefas" },
      { status: 500 }
    );
  }
}

