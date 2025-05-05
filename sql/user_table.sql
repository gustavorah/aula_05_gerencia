-- SQL to create the users table for authentication

CREATE TABLE IF NOT EXISTS public.usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP WITHOUT TIME ZONE,
    ativo BOOLEAN DEFAULT TRUE
);

-- Add foreign key to tarefa table to link tasks to users
ALTER TABLE public.tarefa
ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES public.usuario(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_usuario_email ON public.usuario(email);

