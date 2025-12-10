📅 Planner App (Local-First)

Um aplicativo de produtividade pessoal, rastreamento de hábitos e gestão de leitura, focado em gamificação e funcionamento 100% offline (Local-First).

O app utiliza uma arquitetura robusta baseada em SQLite, garantindo que os dados pertencem ao usuário e estão sempre disponíveis, com uma interface moderna e altamente personalizável.

🚀 Funcionalidades Principais

1. 🏠 Home (Dashboard Gamificado)

Layout Bento Grid: Visualização moderna com destaque para o "Foco do Dia".

Gamificação:

🔥 Ofensiva (Streak): Contador de dias consecutivos de uso.

❤️ Vidas (Freeze Days): Sistema de proteção de ofensiva (regenera a cada 7 dias de streak).

🎉 Celebração: Animação de confetes ao concluir tarefas ou bater metas.

Métricas Rápidas: Input otimizado para registrar água, páginas lidas, horas de estudo, etc.

2. 📚 Biblioteca (Gestão de Leitura)

Status de Leitura: Organização por "Para Ler", "Lendo" e "Lido".

Progresso Visual: Barras de progresso baseadas na página atual vs. total.

Atualização Inteligente: Ao digitar a página atual, o status do livro muda automaticamente (ex: iniciou -> Lendo, terminou -> Lido).

3. 🎯 Metas & Hábitos

Metas de Longo Prazo: Organizadas por Ano, Mês e Semana.

Hábitos Diários: Sistema de Templates. Você define os hábitos no perfil e o app gera automaticamente a lista de checagem para cada novo dia.

Tarefas Avulsas: Adição rápida de to-dos específicos para o dia.

4. 📊 Estatísticas

Gráficos: Visualização semanal do desempenho em métricas específicas (via react-native-chart-kit).

Médias e Totais: Resumo geral de produtividade calculado via SQL.

5. 🎨 Personalização (Theme Engine)

Temas Predefinidos: Ocean, Forest, Dracula, Coffee.

Cores Personalizadas: O usuário pode escolher qualquer cor Hexadecimal e o app adapta toda a UI instantaneamente.

Arquitetura "Blindada": Uso de useMemo e fallbacks de segurança para garantir que a troca de temas nunca cause crashes ou telas brancas.

🛠️ Stack Tecnológica

Framework: React Native (Expo SDK 52+).

Linguagem: TypeScript.

Banco de Dados: expo-sqlite (Armazenamento local persistente e síncrono).

Navegação: expo-router (Navegação baseada em arquivos).

UI/Estilos: StyleSheet com Context API para temas dinâmicos.

Animações: react-native-confetti-cannon, react-native-reanimated.

Gráficos: react-native-chart-kit.

Ícones: Feather e Ionicons (@expo/vector-icons).

💾 Estrutura do Banco de Dados (SQLite)

O aplicativo utiliza um banco relacional local (planner.db) com as seguintes tabelas principais:

Tabela

Descrição

tasks

Tarefas e Hábitos do dia a dia (com coluna type para diferenciar).

daily_logs

Registro diário contendo o Foco do dia e um JSON com as métricas atingidas.

habit_templates

Modelos de hábitos configurados no perfil que são clonados diariamente.

goals

Metas de curto, médio e longo prazo.

books

Livros da biblioteca com controle de páginas e status.

user_stats

Armazena a Gamificação (Streak, Vidas) e o Tema atual.

users

Autenticação local (Simulação de login/perfil).

metric_definitions

Configuração das métricas que o usuário quer rastrear (Nome, Unidade, Meta).

📂 Estrutura de Pastas

/app
  /(tabs)          # Telas principais (Dashboard, Goals, Stats, Library, Profile)
  /daily-detail    # Tela de detalhes do dia [date]
  /settings        # Telas de configuração (Temas, Métricas, Hábitos)
  _layout.tsx      # Configuração global de navegação e Providers
/components
  /ui              # Componentes visuais (BentoGrid, Card, MetricInput)
  BookItem.tsx     # Componente inteligente de livro
  ThemeSelector.tsx# Seletor de cores com preview
/context           # AppContext (Estado global do usuário)
/database          # index.ts (Inicialização e Migrations do SQLite)
/hooks             # Hooks customizados (useGamification, useMetricSettings, etc.)
/theme             # Lógica de Cores e ThemeProvider


🚀 Como Rodar o Projeto

Instale as dependências:

npm install --legacy-peer-deps


(A flag --legacy-peer-deps é necessária devido a conflitos de versão entre React 19 e bibliotecas nativas atuais).

Inicie o servidor de desenvolvimento:

npx expo start -c


(A flag -c limpa o cache, recomendado ao trocar configurações de banco ou tema).

Gerar APK (Android):

eas build -p android --profile preview
