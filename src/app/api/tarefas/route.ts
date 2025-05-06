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
