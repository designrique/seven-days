import type { ExecutionContext, D1Database } from '@cloudflare/workers-types';

// ─── CORS ────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function handleOptions(): Response {
  return new Response(null, { headers: corsHeaders });
}

function corsResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── HELPERS ─────────────────────────────────────────
function getUserId(_request: Request): string {
  // TODO: extrair o userId da sessão next-auth via cookie
  return 'user-placeholder-id';
}

// ─── MAIN ────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') return handleOptions();

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── Transcrever áudio (Whisper) ──────────────────
    if (path === '/api/transcribe' && method === 'POST') {
      try {
        const formData = await request.formData();
        const audioBlob = formData.get('audio');
        if (!audioBlob || !(audioBlob instanceof Blob)) {
          return corsResponse({ error: 'Ficheiro de áudio não encontrado.' }, 400);
        }

        const result = await env.AI.run('@cf/openai/whisper', {
          audio: [...new Uint8Array(await audioBlob.arrayBuffer())],
        });

        return corsResponse(result);
      } catch (e) {
        console.error('Transcribe error:', e);
        return corsResponse({ error: 'Falha na transcrição.' }, 500);
      }
    }

    // ── Analisar texto (Llama 3) ─────────────────────
    if (path === '/api/analyze' && method === 'POST') {
      try {
        const { text } = (await request.json()) as { text?: string };
        if (!text || typeof text !== 'string') {
          return corsResponse({ error: 'Texto não fornecido.' }, 400);
        }

        const prompt = `Analise o seguinte texto em inglês e retorne um único objeto JSON, sem formatação de markdown.
O objeto deve ter as seguintes chaves:
1. "nivel_cefr": Uma string com a estimativa do nível CEFR (ex: "A2", "B1", "B2").
2. "justificacao_cefr": Uma string curta a justificar a estimativa do nível.
3. "contagem_palavras": Um número total de palavras.
4. "analise_gramatical": Um objeto com a contagem de "substantivos", "verbos", "adjetivos", e "preposicoes".
5. "erros_identificados": Um array de strings, onde cada string descreve um erro gramatical encontrado.
6. "sugestoes": Um array de strings, com sugestões para melhorar o texto.
7. "topicos_recomendados": Um array de strings com tags de tópicos de estudo (ex: "prepositions", "phrasal-verbs", "past-tense").

Texto para analisar: "${text}"`;

        const analysisResult = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          prompt,
        });

        // Persistir na D1
        const userId = getUserId(request);
        const recordingId = crypto.randomUUID();
        const createdAt = Date.now();

        try {
          await env.DB.prepare(
            `INSERT INTO recordings (id, userId, createdAt, transcription, analysis) VALUES (?, ?, ?, ?, ?)`
          ).bind(recordingId, userId, createdAt, text, JSON.stringify(analysisResult)).run();

          // Atribuir XP
          await env.DB.prepare(
            `INSERT INTO user_stats (userId, level, xp, streak) VALUES (?, 1, 10, 1)
             ON CONFLICT(userId) DO UPDATE SET xp = xp + 10`
          ).bind(userId).run();
        } catch (dbError) {
          console.error('DB write error:', dbError);
          // Não falhamos o pedido — a análise já foi feita
        }

        return corsResponse(analysisResult);
      } catch (e) {
        console.error('Analyze error:', e);
        return corsResponse({ error: 'Falha na análise.' }, 500);
      }
    }

    // ── Listar gravações do utilizador ──────────────
    if (path === '/api/recordings' && method === 'GET') {
      try {
        const userId = getUserId(request);
        const { results } = await env.DB.prepare(
          `SELECT * FROM recordings WHERE userId = ? ORDER BY createdAt DESC`
        ).bind(userId).all();
        return corsResponse(results);
      } catch (e) {
        console.error('Recordings error:', e);
        return corsResponse({ error: 'Erro ao obter gravações.' }, 500);
      }
    }

    // ── Obter imagem aleatória ───────────────────────
    if (path === '/api/images' && method === 'GET') {
      // TODO: selecionar imagem aleatória do Cloudflare Images
      return corsResponse({
        url: 'https://imagedelivery.net/95QNk3aY_HvrIQQ2qa_b-Q/7bc1aa25-534c-4731-5a05-48b488554900/public',
      });
    }

    // ── Upload de imagem (admin) ─────────────────────
    if (path === '/api/images/upload' && method === 'POST') {
      // TODO: integrar com Cloudflare Images API
      return corsResponse({ success: true, message: 'Upload simulado com sucesso!' });
    }

    // ── Criar turma (professor) ──────────────────────
    if (path === '/api/classes' && method === 'POST') {
      try {
        const { name } = (await request.json()) as { name?: string };
        if (!name) return corsResponse({ error: 'Nome da turma obrigatório.' }, 400);

        const teacherId = getUserId(request);
        const classId = crypto.randomUUID();
        const inviteCode = crypto.randomUUID().slice(0, 8);

        await env.DB.prepare(
          `INSERT INTO classes (id, name, teacherId, inviteCode) VALUES (?, ?, ?, ?)`
        ).bind(classId, name, teacherId, inviteCode).run();

        return corsResponse({ success: true, inviteCode, classId });
      } catch (e) {
        console.error('Create class error:', e);
        return corsResponse({ error: 'Erro ao criar turma.' }, 500);
      }
    }

    // ── Juntar-se a turma (aluno) ────────────────────
    if (path === '/api/classes/join' && method === 'POST') {
      try {
        const { inviteCode } = (await request.json()) as { inviteCode?: string };
        if (!inviteCode) return corsResponse({ error: 'Código de convite obrigatório.' }, 400);

        const { results } = await env.DB.prepare(
          `SELECT id FROM classes WHERE inviteCode = ?`
        ).bind(inviteCode).all();

        if (!results || results.length === 0) {
          return corsResponse({ error: 'Código de convite inválido.' }, 404);
        }

        const classId = (results[0] as { id: string }).id;
        const studentId = getUserId(request);

        await env.DB.prepare(
          `INSERT OR IGNORE INTO class_members (classId, studentId) VALUES (?, ?)`
        ).bind(classId, studentId).run();

        return corsResponse({ success: true, classId, message: 'Juntou-se à turma!' });
      } catch (e) {
        console.error('Join class error:', e);
        return corsResponse({ error: 'Erro ao juntar-se à turma.' }, 500);
      }
    }

    // ── Ver alunos de uma turma (professor) ──────────
    if (path.startsWith('/api/classes/') && path.endsWith('/students') && method === 'GET') {
      try {
        const classId = path.split('/')[3];
        const { results } = await env.DB.prepare(
          `SELECT u.id, u.name, u.email, us.level, us.xp
           FROM class_members cm
           JOIN users u ON u.id = cm.studentId
           LEFT JOIN user_stats us ON us.userId = u.id
           WHERE cm.classId = ?`
        ).bind(classId).all();

        return corsResponse(results);
      } catch (e) {
        console.error('Students list error:', e);
        return corsResponse({ error: 'Erro ao obter alunos.' }, 500);
      }
    }

    // ── Estatísticas do utilizador ───────────────────
    if (path === '/api/user/stats' && method === 'GET') {
      try {
        const userId = getUserId(request);
        const { results } = await env.DB.prepare(
          `SELECT * FROM user_stats WHERE userId = ?`
        ).bind(userId).all();

        const stats = results && results.length > 0
          ? results[0]
          : { level: 1, xp: 0, streak: 0 };

        return corsResponse(stats);
      } catch (e) {
        console.error('Stats error:', e);
        return corsResponse({ error: 'Erro ao obter estatísticas.' }, 500);
      }
    }

    // ── Conteúdo recomendado por tópico ──────────────
    if (path === '/api/content' && method === 'GET') {
      const topic = url.searchParams.get('topic');
      if (!topic) return corsResponse({ error: 'Parâmetro "topic" obrigatório.' }, 400);

      try {
        const { results } = await env.DB.prepare(
          `SELECT * FROM learning_content WHERE topic = ?`
        ).bind(topic).all();
        return corsResponse(results);
      } catch (e) {
        console.error('Content error:', e);
        return corsResponse({ error: 'Erro ao obter conteúdo.' }, 500);
      }
    }

    // ── Fallback ─────────────────────────────────────
    return corsResponse({ error: 'Endpoint não encontrado.' }, 404);
  },
};

// ─── ENVIRONMENT ─────────────────────────────────────
interface Env {
  AI: any;
  DB: D1Database;
}