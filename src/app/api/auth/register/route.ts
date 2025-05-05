import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import pool from "../../../../../../db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract data from the request body
    const { nome, email, senha } = body;
    
    // Validate input
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }
    
    // Password validation
    if (senha.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await pool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(senha, 10);
    
    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO usuario (nome, email, senha, data_criacao)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, nome, email, data_criacao`,
      [nome, email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    
    return NextResponse.json({
      message: "Usuário registrado com sucesso",
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        data_criacao: newUser.data_criacao
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar o registro. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

