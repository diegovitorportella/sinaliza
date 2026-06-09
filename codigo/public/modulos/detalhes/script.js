// EVENTO 1: Disparado assim que a página de Detalhes carrega
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. A PASSAGEM DE BASTÃO: Ler a barra de endereços do navegador
    const params = new URLSearchParams(window.location.search);
    const restauranteId = params.get('id') || params.get('restauranteId');

    // Se o utilizador tentar abrir a página direto sem clicar num restaurante (sem ID)
    if (!restauranteId) {
        document.getElementById('estado-carregando').classList.add('hidden');
        document.getElementById('estado-erro').classList.remove('hidden');
        return;
    }

    // ==========================================
    // NOVA AÇÃO: Atualizar os links dos botões com o ID do restaurante atual
    // ==========================================
    document.getElementById('link-gerenciar-cardapio').href = `../cadastro_pratos_preços/index.html?restauranteId=${restauranteId}`;
    document.getElementById('link-avaliar').href = `../formulario_avaliacoes/index.html?restauranteId=${restauranteId}`;

    // 2. Chama as funções para buscar os dados em paralelo
    carregarDetalhesRestaurante(restauranteId);
    carregarCardapio(restauranteId);
    carregarAvaliacoes(restauranteId);
});

// ==========================================
// FUNÇÃO: CARREGAR DADOS PRINCIPAIS DO RESTAURANTE
// ==========================================
async function carregarDetalhesRestaurante(id) {
    try {
        const resposta = await fetch(`http://localhost:3000/restaurantes/${id}`);
        
        if (!resposta.ok) {
            throw new Error('Restaurante não encontrado no banco de dados');
        }

        const restaurante = await resposta.json();
        
        // Esconde o spinner de loading e mostra a tela principal
        document.getElementById('estado-carregando').classList.add('hidden');
        document.getElementById('conteudo-principal').classList.remove('hidden');

        // Joga os dados capturados na tela (DOM)
        preencherDadosNaTela(restaurante);

    } catch (erro) {
        console.error("Erro na busca do restaurante:", erro);
        document.getElementById('estado-carregando').classList.add('hidden');
        document.getElementById('estado-erro').classList.remove('hidden');
    }
}

function preencherDadosNaTela(restaurante) {
    // Textos Básicos
    document.getElementById('det-nome').textContent = restaurante.nome;
    document.getElementById('det-descricao').textContent = restaurante.descricao;
    document.getElementById('det-endereco').textContent = restaurante.endereco || 'Endereço não cadastrado';
    document.getElementById('det-cidade').textContent = restaurante.cidade;
    document.getElementById('det-telefone').textContent = restaurante.telefone || 'Não informado';
    document.getElementById('det-horario').textContent = restaurante.horario || 'Não informado';
    document.getElementById('det-tipo-cozinha').textContent = restaurante.tipoCozinha;

    // Foto da Capa
    let fotoUrl = (restaurante.foto && restaurante.foto.length > 15) ? restaurante.foto : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    document.getElementById('det-foto').src = fotoUrl;

    // Badge de Libras no topo
    if (restaurante.checklist && restaurante.checklist.comunicacao && restaurante.checklist.comunicacao.libras) {
        document.getElementById('det-libras-badge').classList.remove('hidden');
    }

    // Processa o selo e a barra de acessibilidade
    configurarPontuacaoVisual(restaurante.pontuacaoAcessibilidade);
    
    // Adiciona os balões de checklist de acessibilidade na tela
    renderizarChecklist(restaurante.checklist);
}

function configurarPontuacaoVisual(nota) {
    const barraFill = document.getElementById('det-pontuacao-fill');
    const label = document.getElementById('det-pontuacao-label');
    const seloIcon = document.getElementById('det-selo-icon');
    const seloTexto = document.getElementById('det-selo-texto');
    const seloContainer = document.getElementById('det-selo');

    let percentual = (nota / 10) * 100;
    if (barraFill) barraFill.style.width = `${percentual}%`;
    if (label) label.textContent = `Pontuação Geral: ${nota}/10`;

    if (!seloContainer) return;

    if (nota >= 7) {
        barraFill.style.backgroundColor = '#15803d'; // Verde
        seloContainer.style.backgroundColor = '#dcfce7';
        seloContainer.style.color = '#15803d';
        seloIcon.textContent = '✓';
        seloTexto.textContent = 'ACESSIBILIDADE ALTA';
    } else if (nota >= 4) {
        barraFill.style.backgroundColor = '#b45309'; // Amarelo
        seloContainer.style.backgroundColor = '#fef3c7';
        seloContainer.style.color = '#b45309';
        seloIcon.textContent = '⚠';
        seloTexto.textContent = 'ACESSIBILIDADE MÉDIA';
    } else {
        barraFill.style.backgroundColor = '#b91c1c'; // Vermelho
        seloContainer.style.backgroundColor = '#fee2e2';
        seloContainer.style.color = '#b91c1c';
        seloIcon.textContent = '✖';
        seloTexto.textContent = 'ACESSIBILIDADE BAIXA';
    }
}

// ==========================================
// FUNÇÃO: CARREGAR OS BALÕES DO CHECKLIST
// ==========================================
function renderizarChecklist(checklist) {
    const container = document.getElementById('det-checklist');
    if (!container) return;
    
    container.innerHTML = ''; // Limpa o container

    // Se o restaurante não tiver checklist cadastrado, avisa na tela
    if (!checklist) {
        container.innerHTML = '<p class="text-muted small">Nenhum recurso de acessibilidade detalhado.</p>';
        return;
    }

    // Dicionário para traduzir as propriedades do JSON para português legível
    const nomesAmigaveis = {
        libras: "Atendimento em LIBRAS",
        cardapioImagens: "Cardápio em Imagens",
        cardapioDigitalAcessivel: "Cardápio Digital Acessível",
        chatTexto: "Chat por Texto",
        qrCode: "QR Code nas Mesas",
        tabletPedidos: "Pedidos via Tablet",
        pedidoVisual: "Acompanhamento Visual",
        chamadaVisual: "Chamada Visual de Garçom",
        funcionariosTreinados: "Equipe Treinada",
        tempoRespostaRapido: "Atendimento Rápido",
        ambienteVisual: "Ambiente Visualmente Claro",
        sinalizacao: "Sinalização Adequada"
    };

    // O checklist do JSON está dividido em categorias (comunicacao, tecnologia, etc.)
    // Vamos percorrer todas elas e pegar o que for "true"
    for (const categoria in checklist) {
        for (const item in checklist[categoria]) {
            
            // Se o restaurante possui este recurso (true)
            if (checklist[categoria][item] === true) {
                
                // Pega o nome traduzido ou usa a chave original se não achar
                const texto = nomesAmigaveis[item] || item;
                
                // Cria o "balão" usando as classes do Bootstrap
                const balao = document.createElement('div');
                balao.className = 'd-inline-flex align-items-center bg-white border border-secondary-subtle rounded-pill px-3 py-1 me-2 mb-2 shadow-sm';
                balao.innerHTML = `
                    <span class="text-success me-2" style="font-weight: 900;">✓</span> 
                    <span class="text-secondary small fw-semibold">${texto}</span>
                `;
                
                container.appendChild(balao);
            }
        }
    }
}

// ==========================================
// FUNÇÃO: CARREGAR O CARDÁPIO DO RESTAURANTE
// ==========================================
async function carregarCardapio(restauranteId) {
    try {
        const resposta = await fetch(`http://localhost:3000/cardapio?restauranteId=${restauranteId}`);
        const cardapio = await resposta.json();
        
        const container = document.getElementById('lista-cardapio');
        if (!container) return;
        
        container.innerHTML = ''; 
        
        if (cardapio.length === 0) {
            // grid-column: 1/-1 faz a mensagem ocupar a tela toda ao invés de ficar presa numa coluninha
            container.innerHTML = '<p style="color: #64748b; font-style: italic; grid-column: 1/-1;">Nenhum item cadastrado no cardápio deste restaurante.</p>';
            return;
        }

        cardapio.forEach(item => {
            const div = document.createElement('div');
            // Voltamos a usar a classe original do seu CSS para manter o design em "grid"
            div.className = 'card-prato bg-white shadow-sm'; 
            
            div.innerHTML = `
                <img src="${item.urlFoto}" alt="${item.nome}">
                <div class="prato-info">
                    <h3 class="prato-nome">${item.nome}</h3>
                    <p class="prato-descricao">${item.descricao}</p>
                    <div class="prato-rodape mt-2">
                        <span class="prato-categoria">${item.categoria}</span>
                        <span class="prato-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);
    }
}

// ==========================================
// FUNÇÃO: CARREGAR AS AVALIAÇÕES E O RESUMO
// ==========================================
async function carregarAvaliacoes(restauranteId) {
    try {
        // Pede ao JSON Server apenas as avaliações deste restaurante específico
        const resposta = await fetch(`http://localhost:3000/avaliacoes?restauranteId=${restauranteId}`);
        const avaliacoes = await resposta.json();
        
        const containerLista = document.getElementById('lista-avaliacoes');
        const containerResumo = document.getElementById('resumo-avaliacoes');
        
        if (!containerLista) return;
        
        containerLista.innerHTML = '';

        // Se não tiver avaliações, esconde o resumo e avisa
        if (avaliacoes.length === 0) {
            if (containerResumo) containerResumo.classList.add('hidden');
            containerLista.innerHTML = '<p style="color: #64748b; font-style: italic;">Nenhuma avaliação encontrada para este restaurante ainda.</p>';
            return;
        }

        // --- MÁGICA NOVA: Calcular e renderizar o bloco de Resumo ---
        if (containerResumo) {
            containerResumo.classList.remove('hidden'); // Garante que a caixa cinza apareça
            
            let somaNotas = 0;
            avaliacoes.forEach(av => somaNotas += av.nota);
            let media = (somaNotas / avaliacoes.length).toFixed(1); // Ex: 4.5
            
            let estrelasMedia = Math.round(media);
            let estrelasStr = '★'.repeat(estrelasMedia) + '☆'.repeat(5 - estrelasMedia);

            containerResumo.innerHTML = `
                <div class="media-numero">${media}</div>
                <div>
                    <div class="estrelas mb-1" style="line-height: 1;">${estrelasStr}</div>
                    <div class="text-muted small">Baseado em ${avaliacoes.length} avaliação(ões)</div>
                </div>
            `;
        }

        // --- Renderizar a lista de avaliações individuais ---
        avaliacoes.forEach(av => {
            const div = document.createElement('div');
            div.className = 'p-3 mb-3 border rounded bg-white shadow-sm';
            
            // Gerar as estrelas visualmente baseadas na nota (ex: 4 = ★★★★☆)
            let estrelas = '★'.repeat(av.nota) + '☆'.repeat(5 - av.nota);
            
            // Gerar as tags, se existirem
            let tagsHtml = '';
            if (av.tags && av.tags.length > 0) {
                tagsHtml = av.tags.map(t => `<span class="badge bg-light text-primary border border-primary-subtle me-1">${t}</span>`).join('');
            }

            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-warning fs-5">${estrelas}</span>
                    <small class="text-muted fw-bold">${av.nota}/5</small>
                </div>
                <div class="mb-2">${tagsHtml}</div>
                <p class="mb-0 text-dark">"${av.comentario}"</p>
            `;
            containerLista.appendChild(div);
        });
    } catch (erro) {
        console.error("Erro ao carregar avaliações:", erro);
    }
}