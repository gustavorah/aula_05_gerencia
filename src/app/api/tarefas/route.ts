// app/api/tarefas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import pool from "../../../../db";
import { Tarefa, TarefaInput, TaskFilterOptions, ApiResponse, UserSession } from "../../../types/tarefa";
import { sendTaskNotification } from "../../../lib/email";

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
      id: token.id,
      name: token.name as string,
      email: token.email as string
    };
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

// GET all tarefas with filtering options
export async function GET(request: NextRequest) {
  // Get the user from the session
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Não autorizado. Faça login para continuar." },
      { status: 401 }
    );
  }
  
  const url = new URL(request.url);
  const idParam = url.pathname.split('/').pop();
  
  // If there's an ID in the URL, return a specific tarefa
  if (idParam && idParam !== 'tarefas') {
    try {
      const id = parseInt(idParam);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "ID inválido" },
          { status: 400 }
        );
      }
      
      // Include user_id in the query to ensure the user can only access their own tasks
      const result = await pool.query(
        "SELECT * FROM tarefa WHERE id = $1 AND usuario_id = $2", 
        [id, user.id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Tarefa não encontrada" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao buscar tarefa", error);
      return NextResponse.json(
        { error: "Erro ao buscar tarefa" },
        { status: 500 }
      );
    }
  }
  
  // Otherwise, return filtered tasks
  try {
    // Get filter parameters from query string
    const filters: TaskFilterOptions = {
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
      status: url.searchParams.get('status') || undefined,
      searchTerm: url.searchParams.get('search') || undefined
    };
    
    // Start building the query
    let query = "SELECT * FROM tarefa WHERE usuario_id = $1";
    const queryParams: any[] = [user.id];
    let paramCounter = 2;
    
    // Add date range filter
    if (filters.dateFrom) {
      query += ` AND data_criacao >= $${paramCounter++}`;
      queryParams.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query += ` AND data_criacao <= $${paramCounter++}`;
      queryParams.push(filters.dateTo);
    }
    
    // Add status filter
    if (filters.status !== undefined) {
      const statusValue = filters.status === 'true' || filters.status === '1';
      query += ` AND situacao = $${paramCounter++}`;
      queryParams.push(statusValue);
    }
    
    // Add search term filter
    if (filters.searchTerm) {
      query += ` AND descricao ILIKE $${paramCounter++}`;
      queryParams.push(`%${filters.searchTerm}%`);
    }
    
    // Add order by
    query += " ORDER BY data_criacao DESC";
    
    const result = await pool.query(query, queryParams);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar tarefas", error);
    return NextResponse.json(
      { error: "Erro ao buscar tarefas" },
      { status: 500 }
    );
  }
}

// POST a new tarefa
export async function POST(request: NextRequest) {
  try {
    // Get the user from the session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      );
    }
    
    const body: TarefaInput = await request.json();
    
    // Validate the required fields
    if (!body.descricao) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      );
    }

    if (body.data_previsao && ! isNaN(Date.parse(body.data_previsao)) && Date.parse(body.data_previsao) < Date.now()) {
      return NextResponse.json(
        { error: "Data de previsão não pode ser no passado" },
        { status: 400 }
      );
    }
    
    // Default values
    const situacao = body.situacao !== undefined ? body.situacao : false;
    
    // Insert the new tarefa with user_id
    const result = await pool.query(
      `INSERT INTO tarefa 
      (descricao, data_previsao, data_encerramento, situacao, usuario_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [
        body.descricao,
        body.data_previsao || null,
        body.data_encerramento || null,
        situacao,
        user.id
      ]
    );
    
    const newTask = result.rows[0];
    
    // Send email notification
    try {
      await sendTaskNotification(
        'task_created',
        newTask,
        user.email,
        user.name
      );
    } catch (emailError) {
      console.error("Erro ao enviar notificação por email:", emailError);
      // Continue with the response even if email fails
    }
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tarefa", error);
    return NextResponse.json(
      { error: "Erro ao criar tarefa" },
      { status: 500 }
    );
  }
}
