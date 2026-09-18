## SPA de Contagem de Calorias e Hábitos — SparkKcal

# Contexto

Aplicação SPA (Single Page Application) desenvolvida em HTML5, CSS3 e JavaScript puro (Vanilla JS), sem pacotes ou dependências complexas (com exceção opcional da biblioteca Chart.js via CDN para renderização dos gráficos). Hospedada de forma totalmente gratuita no GitHub Pages, com suporte a PWA (Progressive Web App) para ser instalada diretamente na tela inicial do celular como um aplicativo nativo.

# UI e UX (Interface e Experiência do Usuário)
 -  Identidade Visual e Paleta de Cores: Estética moderna, limpa e energética, utilizando tons inspirados no mascote Spark. Fundo off-white limpo (#f8f9fa) no modo claro ou fundo escuro sofisticado (#121417) para modo noturno, com acentos em laranja vibrante (#ff6b00), amarelo energia (#ffca28) e verde sucesso (#2e7d32) para metas batidas.
- Tipografia: Fontes limpas e altamente legíveis (como Inter ou Poppins) para garantir clareza nos números de calorias, metas e listagens rápidas.
 -  Arquitetura de Navegação (Mobile-First): Layout responsivo projetado primariamente para uso em smartphones. Utiliza uma barra de navegação inferior (Bottom Navigation Bar) fixa para transição fluida entre o Dashboard, Diário, Gráficos e Perfil.
- Micro-interações e Feedback Visual: Animações fluidas CSS e estados reativos do mascote Spark (neutro, focado e comemorando) para recompensar o usuário instantaneamente ao registrar uma refeição ou bater a meta de água, gerando engajamento e gamificação leve.
 -  Acessibilidade e Ergonomia: Botões de toque com tamanho adequado para dispositivos móveis (mínimo de 48x48px), contraste validado para leitura sob luz solar e suporte a inputs numéricos otimizados para teclados móveis.
Módulos e Recursos do APP

# Tela Inicial de Configuração / Boas-Vindas (index.html)
- Coleta de Dados Iniciais: Nome do usuário, idade, peso atual, altura, nível de atividade física e objetivo principal (emagrecer, manter ou ganhar massa).
 -  Definição de Metas: Cálculo automático da taxa metabólica basal e estimativa da meta diária de calorias e de água.
   - Persistência Local: Todos os dados inseridos e as metas calculadas são salvos de forma persistente no localStorage.
 -  Acesso Direto: Botão de avançar que redireciona o usuário para o painel principal (Dashboard).
Painel de Controle Principal & Mascote (dashboard.html)
- Mascote Interativo (Spark): Uma chaminha animada em destaque na tela que reage em tempo real às ações do usuário. Possui estados visuais (neutro, focado e feliz/comemorando) controlados via JavaScript e CSS.
 -  Resumo Diário: Exibição imediata das calorias consumidas versus a meta diária, acompanhadas de barras de progresso dinâmicas.
- Ações Rápidas: Botões flutuantes para adicionar refeições rapidamente ou registrar água com um clique.

# Diário Alimentar & Busca Inteligente (diario.html)
 -  Divisão Cronológica: Registro de refeições organizado por blocos (Café da Manhã, Almoço, Jantar e Lanches).
- Busca Inteligente & Recentes: Campo de busca instantânea e histórico dos alimentos mais consumidos para agilizar o preenchimento.
 -  Modo de Edição / Exclusão: Habilita a remoção ou ajuste de itens individuais na lista diária, atualizando os totais de calorias e macronutrientes automaticamente.

# Upload de Fotos de Pratos & IA Simulada (fotos.html)
 -  Registro Visual: Área para o usuário carregar fotos de suas refeições direto da câmera ou galeria do celular (processadas localmente via FileReader e salvas no localStorage).
- Análise Visual: Interface simulada de reconhecimento para estimar visualmente o prato e integrar ao diário alimentar.

# Gráficos de Consumo e Tendências (graficos.html)
 -  Análise Temporal: Utiliza a biblioteca Chart.js para exibir gráficos de linha ou rosca com o histórico do consumo calórico diário e a divisão de macronutrientes (Proteínas, Carboidratos e Gorduras).

# Rastreador de Hidratação / Água (agua.html)
- Controle de Copos: Sistema interativo com ícones de copos para adicionar ou remover o consumo de água do dia.
 -  Barra de Progresso: Indicador visual em tempo real comparando a água ingerida com a meta diária estipulada.

# Monitoramento de Peso e Medidas (medidas.html)
- Evolução Corporal: Formulário para registrar o peso atual, circunferências (cintura, quadril, braços) e percentual de gordura.
 -  Histórico Salvo: Tabela ou lista com as últimas medições para acompanhar o progresso ao longo das semanas, mantendo tudo salvo localmente.

# O que o app NÃO deve fazer
 -  Enviar dados para servidores externos ou banco de dados em nuvem (toda a persistência e manipulação de dados ocorrem estritamente no navegador via localStorage / IndexedDB).
- Exigir cadastros complexos, senhas ou criação de contas em servidores de backend.
 -  Travar a navegação caso o armazenamento local atinja limites (o upload de fotos possui redimensionamento básico ou tratamento para evitar estouro de cota do navegador).
 * Realizar diagnósticos médicos profissionais (o app atua exclusivamente como ferramenta de acompanhamento e autogestão de hábitos).
