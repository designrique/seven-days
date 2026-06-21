-- Schema para a base de dados D1 do projeto Fluency Flow

-- Tabelas requeridas pelo D1Adapter da next-auth
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT,
    email TEXT NOT NULL,
    "emailVerified" INTEGER,
    image TEXT
);
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    "session_state" TEXT,
    FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    expires INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires INTEGER NOT NULL
);

-- Nossa tabela personalizada para guardar as gravações e análises
CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    transcription TEXT NOT NULL,
    analysis JSON NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE
);

-- Tabela para as turmas
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL UNIQUE,
    FOREIGN KEY ("teacherId") REFERENCES users (id) ON DELETE CASCADE
);

-- Tabela de ligação para associar alunos a turmas
CREATE TABLE IF NOT EXISTS class_members (
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    PRIMARY KEY ("classId", "studentId"),
    FOREIGN KEY ("classId") REFERENCES classes (id) ON DELETE CASCADE,
    FOREIGN KEY ("studentId") REFERENCES users (id) ON DELETE CASCADE
);

-- Tabelas de Gamificação
CREATE TABLE IF NOT EXISTS user_stats (
    "userId" TEXT PRIMARY KEY NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    streak INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY NOT NULL, -- ex: 'FIRST_RECORDING', 'STREAK_10_DAYS'
    name TEXT NOT NULL, -- ex: 'Primeira Gravação'
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" INTEGER NOT NULL,
    PRIMARY KEY ("userId", "achievementId"),
    FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY ("achievementId") REFERENCES achievements (id) ON DELETE CASCADE
);

-- Tabela para a Biblioteca de Conteúdo
CREATE TABLE IF NOT EXISTS learning_content (
    id TEXT PRIMARY KEY NOT NULL,
    topic TEXT NOT NULL, -- ex: 'prepositions', 'past-tense'
    title TEXT NOT NULL,
    url TEXT NOT NULL, -- Link para o artigo/vídeo
    type TEXT NOT NULL DEFAULT 'article' -- 'article', 'video', 'exercise'
);

