"use client";

import { FC, useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import AuthButtons from '@/app/components/AuthButtons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

// Componente para o conteúdo recomendado
const RecommendedContent: FC<{ topics: string[] }> = ({ topics }) => {
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (topics.length === 0) return;
      setIsLoading(true);
      try {
        const promises = topics.map(topic =>
          fetch(`${API_URL}/api/content?topic=${topic}`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        setContent(results.flat());
      } catch (err) {
        console.error("Erro ao buscar conteúdo recomendado:", err);
      }
      setIsLoading(false);
    };
    fetchContent();
  }, [topics]);

  if (isLoading) return <p className="text-sm text-gray-500">A procurar recomendações...</p>;
  if (content.length === 0) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-bold mb-2">Conteúdo Recomendado para Si:</h3>
      <ul className="list-disc list-inside">
        {content.map((item: any) => (
          <li key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {item.title} ({item.type})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SpeakPage: FC = () => {
  const { data: session } = useSession();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Obter imagem ao carregar
  useEffect(() => {
    if (!session) return;
    const fetchImage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/images`);
        const data = await response.json();
        setImageUrl(data.url);
      } catch (err) { console.error("Erro ao obter imagem:", err); }
    };
    fetchImage();
  }, [session]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      setTranscription(null);
      setAnalysis(null);
    } catch (err) {
      console.error("Erro ao aceder ao microfone:", err);
      alert("Não foi possível aceder ao microfone. Verifique as permissões do navegador.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!audioURL) return;
    setIsAnalyzing(true);
    try {
      const audioBlob = await fetch(audioURL).then(res => res.blob());
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Falha na transcrição');
      const result = await response.json();
      setTranscription(result.text);
      await handleAnalyze(result.text);
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      alert('Ocorreu um erro ao analisar o áudio.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async (text: string) => {
    if (!text) return;
    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Falha na análise');
      const result = await response.json();
      // O Llama 3 retorna uma string JSON dentro de 'response'
      const parsed = typeof result.response === 'string'
        ? JSON.parse(result.response)
        : result;
      setAnalysis(parsed);
    } catch (error) {
      console.error('Erro na análise:', error);
      alert('Ocorreu um erro ao analisar o texto.');
    }
  };

  // Verificação de autenticação
  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="mb-4">Por favor, faça login para aceder a esta página.</p>
        <AuthButtons />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="absolute top-4 right-4">
        <AuthButtons />
      </div>
      <h1 className="text-3xl font-bold mb-4 mt-12">Página de Gravação de Áudio</h1>
      <p className="mb-6">Clique em &quot;Iniciar Gravação&quot; e descreva a imagem em detalhe.</p>

      {imageUrl ? (
        <img src={imageUrl} alt="Estímulo Visual" className="mx-auto mb-6 rounded shadow-lg" style={{ maxHeight: '300px' }} />
      ) : (
        <p className="mb-6 text-gray-400">A carregar imagem...</p>
      )}

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={handleStartRecording}
          disabled={isRecording || isAnalyzing}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          Iniciar Gravação
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          Parar Gravação
        </button>
      </div>

      {audioURL && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Gravação Concluída</h2>
          <audio src={audioURL} controls className="mx-auto mb-4" />
          <button
            onClick={handleUpload}
            disabled={isAnalyzing}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isAnalyzing ? 'A analisar...' : 'Analisar Áudio'}
          </button>
        </div>
      )}

      {transcription && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-2xl font-semibold mb-2">Transcrição</h2>
          <p className="italic">&quot;{transcription}&quot;</p>
        </div>
      )}

      {analysis && (
        <div className="mt-8 p-4 bg-blue-100 rounded text-left">
          <h2 className="text-2xl font-semibold mb-2 text-center">Análise do Texto</h2>
          <div className="space-y-2">
            <p><strong>Nível CEFR:</strong> {analysis.nivel_cefr} — {analysis.justificacao_cefr}</p>
            <p><strong>Palavras:</strong> {analysis.contagem_palavras}</p>

            {analysis.analise_gramatical && (
              <div>
                <strong>Análise Gramatical:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Substantivos: {analysis.analise_gramatical.substantivos}</li>
                  <li>Verbos: {analysis.analise_gramatical.verbos}</li>
                  <li>Adjetivos: {analysis.analise_gramatical.adjetivos}</li>
                  <li>Preposições: {analysis.analise_gramatical.preposicoes}</li>
                </ul>
              </div>
            )}

            {analysis.erros_identificados && analysis.erros_identificados.length > 0 && (
              <div>
                <strong>Erros Encontrados:</strong>
                <ul className="list-disc list-inside ml-4">
                  {analysis.erros_identificados.map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {analysis.sugestoes && analysis.sugestoes.length > 0 && (
              <div>
                <strong>Sugestões:</strong>
                <ul className="list-disc list-inside ml-4">
                  {analysis.sugestoes.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>

          <RecommendedContent topics={analysis.topicos_recomendados || []} />
        </div>
      )}
    </div>
  );
};

export default SpeakPage;