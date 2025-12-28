# 🎯 PlannerApp: Seu Painel de Controle para a Vida

O PlannerApp é um aplicativo de produtividade e autodesenvolvimento construído para ser seu painel de controle pessoal. Ele combina rastreamento de hábitos, métricas personalizadas e gerenciamento de metas em uma interface unificada, ajudando você a visualizar seu progresso e a se manter motivado todos os dias.

A filosofia do aplicativo é que a melhor maneira de crescer é ter uma visão clara e integrada de suas atividades diárias, semanais e de longo prazo.

## ✨ Funcionalidades Principais

- **Dashboard Unificado:** A tela inicial oferece uma visão geral do seu dia, incluindo o foco principal, seu "streak" (ofensiva) atual, um calendário da semana com progresso diário e acesso rápido para registrar hábitos e métricas.
- **Rastreamento de Hábitos:** Crie, gerencie e arquive hábitos. Marque-os como concluídos a cada dia e visualize seu progresso em um heatmap detalhado na tela de estatísticas.
- **Métricas Personalizadas:** Defina e acompanhe qualquer métrica que desejar (ex: "Copos de Água", "Páginas Lidas", "Horas de Estudo"). Os valores podem ser registrados diariamente e o progresso é exibido em gráficos.
- **Gerenciamento de Metas:** Uma seção dedicada para criar e acompanhar suas metas de longo, médio e curto prazo (Ano, Mês, Semana).
- **Gamificação Motivacional:**
  - **Streak (Ofensiva):** Acompanha quantos dias consecutivos você completou pelo menos uma tarefa, mantendo você engajado.
  - **Dias de Congelamento:** Ganhe "dias de congelamento" que salvam sua ofensiva se você perder um dia.
  - **Missões:** Desbloqueie conquistas pré-definidas ao atingir marcos importantes, como uma ofensiva de 21 dias.
- **Estatísticas Detalhadas:** Uma tela completa de estatísticas que mostra:
  - Resumos gerais e médias diárias de todas as suas métricas.
  - Um **Heatmap** de conclusão para cada hábito individualmente.
  - Um **Gráfico de Linha/Barras** interativo para visualizar a tendência de cada métrica ao longo da última semana.
- **Foco do Dia:** Defina uma prioridade principal para cada dia para manter a clareza sobre o que é mais importante.
- **Tarefas Avulsas:** Adicione tarefas únicas para um dia específico que não fazem parte de um hábito recorrente.
- **Biblioteca de Livros:** Uma seção para catalogar os livros que você está lendo, já leu ou pretende ler.
- **Personalização:** Altere seu nome de exibição e personalize o tema visual do aplicativo (cores primárias, de fundo, etc.).

## 🛠️ Feito Com

Este projeto foi construído com uma abordagem "local-first", onde todos os dados são armazenados diretamente no seu dispositivo, garantindo privacidade e funcionamento offline.

- **Framework:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Roteamento:** [Expo Router](https://docs.expo.dev/router/introduction/) (roteamento baseado em arquivos)
- **Banco de Dados:** [SQLite](https://www.sqlite.org/index.html) através do `expo-sqlite`
- **Gerenciamento de Estado:** [React Context API](https://react.dev/learn/passing-data-deeply-with-context) para o estado global, combinado com hooks customizados para a lógica de negócio.
- **Gráficos e Visualização:** [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- **Manipulação de Datas:** [date-fns](https://date-fns.org/)
- **Ícones:** `@expo/vector-icons` (Ionicons e Feather)
- **Estilização:** `StyleSheet` do React Native com um sistema de tema dinâmico.

## 🚀 Como Começar

Para rodar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (opcional, mas recomendado)
- App do Expo Go no seu smartphone (para testes rápidos) ou um emulador Android/iOS.

### Instalação

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/PedroVNeves/Planner
   cd Planner
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   # ou
   yarn install
   ```

### Rodando o Aplicativo

1. **Inicie o servidor de desenvolvimento do Expo:**
   ```sh
   npx expo start
   ```

2. **Abra no seu dispositivo:**
   - **No iOS:** Abra o aplicativo Câmera e escaneie o QR code que aparece no terminal.
   - **No Android:** Abra o aplicativo Expo Go e escaneie o QR code.

   Alternativamente, você pode rodar em um emulador pressionando `a` (para Android) ou `i` (para iOS) no terminal onde o Expo está rodando.

## 📁 Estrutura do Projeto

```
/
├── app/              # Rotas do aplicativo (Expo Router)
│   ├── (tabs)/       # Rotas do navegador de abas principal
│   ├── settings/     # Telas de configuração
│   └── ...
├── assets/           # Fontes, ícones e imagens
├── components/       # Componentes React reutilizáveis
├── constants/        # Constantes do aplicativo (cores, etc.)
├── context/          # Provedores de Contexto React para estado global
├── database/         # Lógica de inicialização e acesso ao SQLite
├── hooks/            # Hooks customizados com lógica de negócio
├── theme/            # Sistema de temas e cores
└── utils/            # Funções utilitárias (datas, etc.)
```
