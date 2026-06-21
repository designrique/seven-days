"use client";

import { FC, useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import AuthButtons from '@/app/components/AuthButtons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

const TeacherDashboardPage: FC = () => {
  const { data: session } = useSession();
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState<any[]>([]); // Para guardar as turmas do professor
  const [message, setMessage] = useState('');

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage(`Turma criada! Código de Convite: ${result.inviteCode}`);
        // Idealmente, aqui faríamos refresh da lista de turmas
      } else {
        setMessage('Erro ao criar a turma.');
      }
    } catch (err) {
      setMessage("Ocorreu um erro.");
    }
  };

  // Acesso restrito
  if (session?.user?.email !== "jsmith@example.com") {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Esta é uma área para professores.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
        <div className="absolute top-4 right-4">
          <AuthButtons />
        </div>
      <h1 className="text-3xl font-bold mb-8 mt-12 text-center">Dashboard do Professor</h1>

      {/* Formulário para criar turma */}
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Criar Nova Turma</h2>
        <form onSubmit={handleCreateClass}>
          <input 
            type="text" 
            value={className} 
            onChange={(e) => setClassName(e.target.value)} 
            placeholder="Nome da Turma" 
            className="w-full p-2 border rounded mb-4"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Criar Turma
          </button>
          {message && <p className="mt-4 text-center">{message}</p>}
        </form>
      </div>

      {/* Lista de turmas e alunos */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Minhas Turmas</h2>
        <div className="p-4 bg-gray-100 rounded">
            <p>Em breve: a lista das suas turmas e alunos.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
