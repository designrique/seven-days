"use client";

import { FC, useState } from 'react';
import { useSession } from "next-auth/react";
import AuthButtons from '@/app/components/AuthButtons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

const AdminUploadPage: FC = () => {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecione um ficheiro.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setMessage(`Imagem enviada com sucesso! ID: ${result.result?.id || 'simulado'}`);
        setFile(null);
      } else {
        setMessage(`Erro: ${result.errors[0]?.message || 'desconhecido'}`);
      }
    } catch (err) {
      setMessage("Ocorreu um erro no upload.");
      console.error(err);
    }
  };

  // Acesso restrito a um utilizador específico
  if (session?.user?.email !== "jsmith@example.com") {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Esta é uma área protegida para administradores.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="absolute top-4 right-4">
        <AuthButtons />
      </div>
      <h1 className="text-3xl font-bold mb-8 mt-12 text-center">Admin: Upload de Imagens</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label htmlFor="file" className="block text-gray-700 font-bold mb-2">Selecione a Imagem</label>
          <input type="file" id="file" onChange={handleFileChange} accept="image/*" className="w-full" />
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Enviar Imagem
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default AdminUploadPage;
