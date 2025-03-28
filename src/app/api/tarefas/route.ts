// app/api/tarefas/route.ts
import { NextResponse } from "next/server";
import pool from "../../../../db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM tarefa");

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar tarefas", error);
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 });
  }
}