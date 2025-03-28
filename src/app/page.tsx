"use client";
import { useEffect, useState } from "react";

interface Tarefa {
  id: number;
  descricao: string;
  data_criacao: string;
  data_previsao: string;
  data_encerramento: string;
  situacao: string;
}
export default function TarefaView() {
  const [tarefas, setTarefas] = useState<Array<Tarefa>>([]);
  const getTarefas = async () => {
    const response = await fetch("/api/tarefas");
    return response.json();
  };

  useEffect(() => {
    getTarefas().then((response) => {
      setTarefas(response);
    });
  }, []);

  return (
    <div>
      <div className="flex justify-center">
        <h1>Lista de Tarefas</h1>
      </div>
      {tarefas ? (
        tarefas.map((tarefa) => (
          <div className="flex justify-center border-2 border-gray-200 p-4 w-1/2">
            <div key={tarefa.id}>
              <ul>
                <li>Id: {tarefa.id}</li>
                <li>Descricao: {tarefa.descricao}</li>
                <li>Data criacao: {tarefa.data_criacao}</li>
                <li>Data previsao: {tarefa.data_previsao}</li>
                <li>Data encerramento: {tarefa.data_encerramento}</li>
                <li>Situacao: {tarefa.situacao}</li>
              </ul>
            </div>
          </div>
        ))
      ) : (
        <div>Sem tarefas</div>
      )}
    </div>
  );
}
