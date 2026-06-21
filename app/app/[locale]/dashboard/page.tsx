"use client";

import { FC, useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import AuthButtons from '@/app/components/AuthButtons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    if (session) {
      const fetchRecordings = async () => {
        try {
          const response = await fetch(`${API_URL}/api/recordings`);
          if (!response.ok) throw new Error('Falha ao obter gravações');
          const data = await response.json();
          setRecordings(data);
        } catch (error) {
          console.error("Erro ao obter gravações:", error);
        }
      };

      const fetchStats = async () => {
        try {
          const response = await fetch(`${API_URL}/api/user/stats`);
          if (!response.ok) throw new Error('Falha ao obter estatísticas');
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error("Erro ao obter estatísticas:", error);
        }
      };

      fetchRecordings();
      fetchStats();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="mb-4">Por favor, faça login para aceder ao seu dashboard.</p>
        <AuthButtons />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="absolute top-4 right-4">
        <AuthButtons />
      </div>
      <h1 className="text-3xl font-bold mb-8 mt-12 text-center">Seu Dashboard</h1>

      {stats && (
          <div className="text-center mb-8 bg-white p-4 rounded shadow">
              <p><strong>Nível:</strong> {stats.level}</p>
              <p><strong>XP:</strong> {stats.xp}</p>
          </div>
      )}
      
      <div className="space-y-4">
        {recordings.length > 0 ? (
          recordings.map((rec) => (
            <div key={rec.id} className="p-4 bg-white rounded shadow">
              <p className="text-sm text-gray-500">{new Date(rec.createdAt).toLocaleString()}</p>
              <p className="mt-2"><strong>Transcrição:</strong> {rec.transcription}</p>
              {/* A análise precisa de ser duplamente parseada, pois a resposta do Llama é uma string JSON dentro do JSON que guardamos */}
              <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                <p><strong>Nível CEFR:</strong> {JSON.parse(rec.analysis).response.nivel_cefr} ({JSON.parse(rec.analysis).response.justificacao_cefr})</p>
                <p><strong>Palavras:</strong> {JSON.parse(rec.analysis).response.contagem_palavras}</p>
                <p className="mt-1"><strong>Erros:</strong> {JSON.parse(rec.analysis).response.erros_identificados.join(', ') || "Nenhum"}</p>
                <p className="mt-1"><strong>Sugestões:</strong> {JSON.parse(rec.analysis).response.sugestoes.join(', ') || "Nenhuma"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Ainda não tem gravações.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
