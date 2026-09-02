


# Contador de Calorias Inteligente com Registro Fotográfico

# Contexto

Criar uma **aplicação SPA (Single Page Application)** para entusiastas de vida saudável e pacientes em reeducação alimentar registrarem o consumo diário de calorias de forma extremamente rápida, permitindo capturar fotos dos pratos diretamente pelo celular no momento da refeição.

# Requisitos

1.  **Gerenciamento de Refeições:** O usuário pode visualizar, adicionar, marcar como consumida e excluir registros alimentares do dia (ex: 08:00 - Café da Manhã - 350 kcal).
2.  **Captura de Imagem via Câmera:** Integração com a câmera do dispositivo móvel para tirar fotos dos pratos em tempo real ou fazer o upload da galeria, exibindo uma miniatura visual ao lado de cada refeição.
3.  **Contador e Meta Diária:** Exibir em tempo real uma barra de progresso e um contador numérico mostrando o total de calorias consumidas versus a meta diária estipulada pelo usuário.

# Recursos Adicionais

1.  **Ajuste Rápido de Porções:** Botões rápidos para multiplicar ou fracionar o tamanho do prato registrado (0.5x meia porção, 1.5x porção grande, 2x porção dupla). Ao acionar, o sistema recalcula de forma automática e instantânea o valor calórico daquela refeição e atualiza o total do dia.
2.  **Filtros de Período Dinâmicos:** Permitir alternar a visualização do diário alimentar entre os períodos do dia: "Ver Todas", "Café da Manhã", "Almoço", "Jantar" e "Lanches".

# Stack

-   **HTML5 (com API de Câmera/Media Capture), CSS3 e JavaScript Puro (Vanilla)**
-   **Tailwind CSS** (via CDN oficial) para acelerar a estilização e reduzir código CSS customizado.
-   **Hospedagem:** Preparado para publicação direta e gratuita no **GitHub Pages**.

# UI/UX

-   **Mobile First:** Interface totalmente otimizada para smartphones, visto que o usuário registrará a alimentação no momento exato do consumo através do celular.
-   **Estética Clean/Fitness:** Uso de paleta de cores moderna, limpa e convidativa (tons de verde saúde, brancos e cinzas claros texturizados) com tipografia sans-serif de alta legibilidade.
-   **Micro-interações:** Transições suaves ao abrir a câmera nativa, animações de fade ao adicionar novos pratos e atualização fluida e animada do círculo ou barra de progresso calórico.

# Instruções para Agentes de IA

1.  Analise sempre a viabilidade do desenvolvimento.
2.  Não havendo viabilidade, não execute a tarefa e solicite interação humana.
3.  Todo ajuste, correção ou incrementação deve ser registrado em um arquivo de backlog. Salve o arquivo em `/spec/backlog.md` registrando a data, a hora e a tarefa executada.

