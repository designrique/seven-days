# Plano de Projeto: Plataforma de Aprendizagem "Fluency Flow"

**Projeto:** sevendays
**Data:** 27/06/2026

## 1. Visão Geral e Objetivos

O objetivo deste projeto é desenvolver uma plataforma de e-learning de inglês, denominada "Fluency Flow", destinada a alunos do ensino fundamental e médio. A plataforma focará na melhoria da fluência oral através de um ciclo de prática e feedback impulsionado por Inteligência Artificial, baseado no conceito da "Leverage Tool".

## 2. Público-Alvo

- **Primário:** Alunos de turmas do ensino fundamental e médio.
- **Secundário:** Professores e administradores escolares que poderão acompanhar o progresso dos alunos.

## 3. Conceito Central (Core Loop)

O fluxo de aprendizagem principal, extraído do documento "PASSO A PASSO LEVERAGE TOOL", é o seguinte:

1.  **Estímulo:** O aluno recebe um estímulo visual (uma imagem) na plataforma.
2.  **Produção Oral:** O aluno grava um áudio, descrevendo a imagem com o máximo de detalhes possível, com a duração mínima de 1 minuto.
3.  **Análise por IA:** O áudio é enviado para o sistema, que:
    a. Transcreve o áudio para texto.
    b. Analisa o texto para avaliar vocabulário, gramática (uso de adjetivos, preposições, tempos verbais), e métricas de fluência.
4.  **Feedback & Nivelamento:** A plataforma gera e apresenta um relatório detalhado ao aluno, contendo:
    a. A transcrição completa do seu áudio.
    b. Gráficos visuais sobre o uso de diferentes classes de palavras (substantivos, adjetivos, etc.).
    c. O seu nível de proficiência, mapeado para o Quadro Europeu Comum de Referência para as Línguas (CEFR).
5.  **Prática Guiada:** Com base nas áreas que necessitam de melhoria, a plataforma recomenda exercícios específicos, artigos e links para estudo (ex: materiais sobre preposições, ordem dos adjetivos, etc.).

## 4. Análise de Referências e Tecnologias

### 4.1. Plataforma de Inspiração
- **Mindset Learning (mindsetlearning.com.br):** Citada como referência. A tentativa de análise automatizada foi bloqueada, sugerindo uma aplicação dinâmica ou com proteção. A sua essência será usada como inspiração para a experiência do utilizador.

### 4.2. Projetos Open Source (Next.js)
A pesquisa por plataformas de aprendizagem de línguas open source em Next.js destacou dois projetos principais:

- **[lingdojo/kana-dojo](https://github.com/lingdojo/kana-dojo):** **(Recomendado como base)** Uma plataforma para aprender japonês inspirada no Duolingo. A sua arquitetura moderna com Next.js, design minimalista e elementos de gamificação fazem dela um excelente ponto de partida para o frontend.
- **[MrHacker26/next-lms](https://github.com/MrHacker26/next-lms):** Um Sistema de Gestão de Aprendizagem (LMS) mais genérico, útil como referência para funcionalidades de gestão de cursos e utilizadores.

## 5. Arquitetura Proposta (Cloudflare Native)

Para garantir compatibilidade total e tirar o máximo partido do ambiente Cloudflare, a arquitetura será focada em serviços "serverless" e de "edge computing".

### 5.1. Frontend
- **Plataforma de Deploy:** Cloudflare Pages
- **Framework:** Next.js
- **Base de Código:** Recomenda-se iniciar a partir de um fork do `lingdojo/kana-dojo` para aproveitar a estrutura de UI/UX, adaptando-o para ser totalmente compatível com o runtime da Cloudflare.

### 5.2. Backend (API)
- **Plataforma de Execução:** Cloudflare Workers
- **Linguagem:** TypeScript
- **Função:** Toda a lógica de negócio, gestão de utilizadores e orquestração das chamadas aos serviços de IA e base de dados será implementada como um Worker, executado na edge.

### 5.3. Serviços de IA e Integrações
- **Plataforma de IA:** Cloudflare Workers AI
    -   **Transcrição de Áudio:** Execução do modelo **Whisper** dentro do Workers AI para converter a fala em texto com baixa latência.
    -   **Análise de Texto (IA):** Uso de um modelo de linguagem (ex: **Llama 3, Gemma**) disponível no Workers AI para avaliar a gramática, semântica e fazer o mapeamento para o CEFR.
- **Base de Dados:** Cloudflare D1
- **Função:** Base de dados SQL serverless, integrada com os Workers, para persistir dados de utilizadores, exercícios, e progresso.

Esta arquitetura "Cloudflare Native" simplifica o deploy, melhora a performance global e pode otimizar os custos, mantendo toda a infraestrutura debaixo de uma única plataforma.

## 6. Plano de Desenvolvimento em Fases

### Fase 1: Prova de Conceito (PoC)
_Objetivo: Validar a viabilidade técnica do core loop._
1.  **Setup:** Clonar o `kana-dojo` para o projeto `sevendays`.
2.  **Interface de Gravação:** Criar uma página simples para o utilizador gravar e enviar um ficheiro de áudio.
3.  **Integração de Transcrição:** Chamar a API do Whisper para obter o texto do áudio.
4.  **Análise Básica:** Criar um script (Python) que recebe o texto e faz uma contagem simples (ex: número de palavras, adjetivos, preposições).
5.  **Exibição do Resultado:** Mostrar a transcrição e a contagem básica na interface.

### Fase 2: Produto Mínimo Viável (MVP)
_Objetivo: Ter uma versão funcional para ser testada por um pequeno grupo de utilizadores._
1.  **Autenticação:** Implementar sistema de login/registo para alunos.
2.  **Dashboard do Aluno:** Página de perfil que mostra o histórico de atividades e o progresso (nível CEFR).
3.  **Motor de Análise v1:** Evoluir o script de análise para fornecer um feedback mais rico:
    - Correções gramaticais.
    - Classificação CEFR inicial (pode ser baseada em heurísticas de vocabulário e complexidade de frases).
4.  **Gestão de Conteúdo:** Sistema básico para administradores adicionarem novas imagens de estímulo.
5.  **Recomendações v1:** Exibir uma lista estática de links de estudo com base nos erros mais comuns.

### Fase 3: Plataforma Completa e Escalável
_Objetivo: Lançar a plataforma com funcionalidades robustas para alunos e professores._
1.  **Dashboard do Professor:** Permitir que professores criem turmas, acompanhem o progresso dos alunos e atribuam exercícios.
2.  **Gamificação:** Implementar sistema de pontos, medalhas, e rankings.
3.  **Motor de Análise v2:** Usar LLMs para um feedback mais contextual e preciso, com geração de exemplos personalizados.
4.  **Recomendações Dinâmicas:** Sugerir exercícios e materiais de forma personalizada com base no histórico de desempenho do aluno.
5.  **Biblioteca de Conteúdo:** Organizar todos os materiais de estudo numa biblioteca pesquisável.

## 7. Próximos Passos Imediatos

1.  Revisar e aprovar este documento de planeamento.
2.  Iniciar a **Fase 1 (PoC)**, começando pelo setup do projeto (clone do `kana-dojo`).
