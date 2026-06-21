-- seed.sql — Dados iniciais para a plataforma Fluency Flow
-- Executar com: npx wrangler d1 execute fluency-flow-db --local --file=seed.sql

-- Conquistas (medalhas)
INSERT OR IGNORE INTO achievements (id, name, description) VALUES
  ('FIRST_RECORDING', 'Primeira Gravação', 'Completou a sua primeira gravação de áudio.'),
  ('TEN_RECORDINGS', '10 Gravações', 'Completou 10 gravações de áudio.'),
  ('LEVEL_B1', 'Nível B1 Atingido', 'Atingiu o nível B1 do CEFR.'),
  ('STREAK_7', '7 Dias Seguidos', 'Praticou durante 7 dias consecutivos.'),
  ('STREAK_30', 'Mestre da Consistência', 'Praticou durante 30 dias consecutivos.'),
  ('PERFECT_SCORE', 'Análise Perfeita', 'Teve uma análise sem erros gramaticais.'),
  ('FIRST_CLASS', 'Primeira Turma', 'Criou a sua primeira turma como professor.');

-- Biblioteca de conteúdo de estudo
INSERT OR IGNORE INTO learning_content (id, topic, title, url, type) VALUES
  ('prep-1', 'prepositions', 'Preposições em Inglês - Guia Completo', 'https://www.perfect-english-grammar.com/prepositions.html', 'article'),
  ('prep-2', 'prepositions', 'Preposições de Lugar e Tempo (7ESL)', 'https://7esl.com/prepositions/', 'article'),
  ('prep-3', 'prepositions', 'Exercícios de Preposições', 'https://agendaweb.org/grammar/prepositions-exercises.html', 'exercise'),
  ('adj-1', 'adjectives', 'Ordem dos Adjetivos (British Council)', 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/adjective-order', 'article'),
  ('adj-2', 'adjectives', 'Adjectives -ed vs -ing (Cambridge)', 'https://dictionary.cambridge.org/grammar/british-grammar/adjectives-ending-in-ed-and-ing', 'article'),
  ('adj-3', 'adjectives', 'Exercícios de Adjetivos', 'https://agendaweb.org/grammar/adjectives-exercises.html', 'exercise'),
  ('past-1', 'past-tense', 'Past Simple - Guia Completo', 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/past-simple', 'article'),
  ('past-2', 'past-tense', 'Exercícios de Past Tense', 'https://agendaweb.org/verbs/past-simple-exercises.html', 'exercise'),
  ('phrasal-1', 'phrasal-verbs', 'Phrasal Verbs - Lista e Explicações', 'https://dictionary.cambridge.org/grammar/british-grammar/phrasal-verbs', 'article'),
  ('phrasal-2', 'phrasal-verbs', '100 Phrasal Verbs Mais Comuns', 'https://www.englishclub.com/vocabulary/phrasal-verbs-list.htm', 'article'),
  ('art-1', 'articles', 'Artigos A/An/The - Quando Usar', 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/definite-article', 'article'),
  ('art-2', 'articles', 'Exercícios de Artigos', 'https://agendaweb.org/grammar/articles-exercises.html', 'exercise'),
  ('pron-1', 'pronouns', 'Pronomes em Inglês - Guia', 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/pronouns', 'article'),
  ('pron-2', 'pronouns', 'Exercícios de Pronomes', 'https://agendaweb.org/grammar/pronouns-exercises.html', 'exercise'),
  ('cond-1', 'conditionals', 'Condicionais (If Clauses)', 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/conditionals-1', 'article'),
  ('cond-2', 'conditionals', 'Exercícios de Condicionais', 'https://agendaweb.org/verbs/conditional-exercises.html', 'exercise'),
  ('numbers-1', 'numbers', 'Números em Inglês (Kumon)', 'https://www.kumon.com.br/blog/ingles1/numero-em-ingles/', 'article'),
  ('numbers-2', 'numbers', 'Praticar Números (Ekvis)', 'https://ekvis.com/pt/ennum01/', 'exercise'),
  ('numbers-3', 'numbers', 'Números em Inglês (EF)', 'https://www.ef.com.br/guia-de-ingles/gramatica-inglesa/numeros-em-ingles/', 'article'),
  ('cefr-1', 'cefr-reference', 'Quadro Europeu Comum de Referência (CEFR)', 'https://www.coe.int/en/web/common-european-framework-reference-languages', 'article'),
  ('cefr-2', 'cefr-reference', 'CEFR - Cambridge English', 'https://www.cambridgeenglish.org/exams-and-tests/cefr/', 'article');