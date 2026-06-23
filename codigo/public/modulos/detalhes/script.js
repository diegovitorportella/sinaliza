const API = 'http://localhost:3000';

// EVENTO 1: Disparado assim que a página de Detalhes carrega
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. A PASSAGEM DE BASTÃO: Ler a barra de endereços do navegador
    const params = new URLSearchParams(window.location.search);
    const restauranteId = params.get('id') || params.get('restauranteId');

    // Se o usuário tentar abrir a página direto sem clicar num restaurante (sem ID)
    if (!restauranteId) {
        document.getElementById('estado-carregando').classList.add('hidden');
        document.getElementById('estado-erro').classList.remove('hidden');
        return;
    }

    // 2. Proteção de Rota: Ocultar o botão "Gerenciar Cardápio" por padrão
    const btnCardapio = document.getElementById('link-gerenciar-cardapio');
    btnCardapio.style.display = 'none';

    // 3. Verifica a sessão para ver se é um restaurante logado
    try {
        const respSessao = await fetch(`${API}/sessao/atual`);
        const sessao = await respSessao.json();
        
        // Se for uma conta de restaurante, exibe o botão apontando para a pasta correta
        if (sessao && sessao.tipo === 'restaurante') {
            btnCardapio.style.display = 'inline-flex';
            btnCardapio.href = `../cadastro_pratos_precos/index.html?restauranteId=${restauranteId}`;
        }
    } catch(e) {
        console.error("Erro ao verificar sessão do usuário:", e);
    }

    // 4. Atualizar o link de avaliações com o ID do restaurante atual
    document.getElementById('link-avaliar').href = `../formulario_avaliacoes/index.html?restauranteId=${restauranteId}`;

    // 5. Chama as funções para buscar os dados em paralelo
    carregarDetalhesRestaurante(restauranteId);
    carregarCardapio(restauranteId);
    carregarAvaliacoes(restauranteId);
});

// ==========================================
// FUNÇÃO: CARREGAR DADOS PRINCIPAIS DO RESTAURANTE
// ==========================================
async function carregarDetalhesRestaurante(id) {
    try {
        const resposta = await fetch(`${API}/restaurantes/${id}`);
        
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
    document.getElementById('det-descricao').textContent = restaurante.descricao || 'Nenhuma descrição cadastrada para este estabelecimento.';
    document.getElementById('det-endereco').textContent = restaurante.endereco || 'Endereço não cadastrado';
    document.getElementById('det-cidade').textContent = restaurante.cidade || '';
    document.getElementById('det-telefone').textContent = restaurante.telefone || 'Não informado';
    document.getElementById('det-horario').textContent = restaurante.horario || 'Não informado';
    document.getElementById('det-tipo-cozinha').textContent = restaurante.tipoCozinha || 'Culinária Mista';

    // Foto da Capa com Fallback
    let fotoUrl = (restaurante.foto && restaurante.foto.length > 15) ? restaurante.foto : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
    document.getElementById('det-foto').src = fotoUrl;

    // Badge de Libras no topo
    if (restaurante.checklist && restaurante.checklist.comunicacao && restaurante.checklist.comunicacao.libras) {
        document.getElementById('det-libras-badge').classList.remove('hidden');
    }

    // Processa o selo e a barra de acessibilidade
    configurarPontuacaoVisual(restaurante.pontuacaoAcessibilidade || 0);
    
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
        if(barraFill) barraFill.style.backgroundColor = '#15803d'; // Verde
        seloContainer.style.backgroundColor = '#dcfce7';
        seloContainer.style.color = '#15803d';
        if(seloIcon) seloIcon.innerHTML = '<i class="bi bi-star-fill"></i>';
        if(seloTexto) seloTexto.textContent = 'ALTA';
    } else if (nota >= 4) {
        if(barraFill) barraFill.style.backgroundColor = '#b45309'; // Amarelo
        seloContainer.style.backgroundColor = '#fef3c7';
        seloContainer.style.color = '#b45309';
        if(seloIcon) seloIcon.innerHTML = '<i class="bi bi-star-half"></i>';
        if(seloTexto) seloTexto.textContent = 'MÉDIA';
    } else {
        if(barraFill) barraFill.style.backgroundColor = '#b91c1c'; // Vermelho
        seloContainer.style.backgroundColor = '#fee2e2';
        seloContainer.style.color = '#b91c1c';
        if(seloIcon) seloIcon.innerHTML = '<i class="bi bi-star"></i>';
        if(seloTexto) seloTexto.textContent = 'BAIXA';
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
        container.innerHTML = '<p class="text-muted small">Nenhum recurso de acessibilidade especificado.</p>';
        return;
    }

    const recursos = [];

    // Lógica para capturar os booleanos do JSON e transformar em visual
    if (checklist.comunicacao?.libras) recursos.push({ icone: 'bi-hands', texto: 'Atendimento em LIBRAS' });
    if (checklist.comunicacao?.menuLibras) recursos.push({ icone: 'bi-menu-button-wide-fill', texto: 'Cardápio em LIBRAS' });
    if (checklist.comunicacao?.sinalizacaoVisual) recursos.push({ icone: 'bi-eye-fill', texto: 'Sinalização Visual' });
    
    if (checklist.fisica?.rampa) recursos.push({ icone: 'bi-triangle-fill', texto: 'Rampa de Acesso' });
    if (checklist.fisica?.banheiro) recursos.push({ icone: 'bi-badge-wc-fill', texto: 'Banheiro Adaptado' });
    if (checklist.fisica?.estacionamento) recursos.push({ icone: 'bi-p-circle-fill', texto: 'Vaga Acessível' });

    if (recursos.length === 0) {
        container.innerHTML = '<p class="text-muted small">Nenhum recurso marcado.</p>';
        return;
    }

    const flexDiv = document.createElement('div');
    flexDiv.className = 'd-flex flex-wrap gap-2';

    recursos.forEach(rec => {
        const span = document.createElement('span');
        span.className = 'badge bg-light text-dark border p-2 fs-6 shadow-sm';
        span.innerHTML = `<i class="bi ${rec.icone} text-primary me-2"></i> ${rec.texto}`;
        flexDiv.appendChild(span);
    });

    container.appendChild(flexDiv);
}

// ==========================================
// FUNÇÃO: CARREGAR O CARDÁPIO (Ajustado para o seu db.json)
// ==========================================
async function carregarCardapio(id) {
    const container = document.getElementById('lista-cardapio');
    
    try {
        // AJUSTE 1: A procurar na rota correta ("/cardapio" em vez de "/pratos")
        const resposta = await fetch(`${API}/cardapio?restauranteId=${id}`);
        
        if (!resposta.ok) {
            throw new Error(`A rota /cardapio não foi encontrada. Status: ${resposta.status}`);
        }

        const pratos = await resposta.json();
        container.innerHTML = '';

        if (!Array.isArray(pratos) || pratos.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhum prato cadastrado no momento.</p></div>';
            return;
        }

        pratos.forEach(prato => {
            // AJUSTE 2: A ler a propriedade "urlFoto" do seu db.json
            let fotoPrato = (prato.urlFoto && prato.urlFoto.length > 10) 
                ? prato.urlFoto 
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';

            // Formatação do Preço (R$ 00,00)
            let precoFormatado = parseFloat(prato.preco || 0).toFixed(2).replace('.', ',');

            const div = document.createElement('div');
            div.className = 'col-md-6 col-lg-4';
            div.innerHTML = `
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" style="transition: transform 0.3s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <img src="${fotoPrato}" alt="${prato.nome}" class="card-img-top" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark mb-2">${prato.nome}</h5>
                        <p class="card-text text-secondary small flex-grow-1">${prato.descricao}</p>
                        <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                            <span class="text-muted small fw-bold text-uppercase">${prato.categoria || 'Prato'}</span>
                            <span class="fw-black text-primary fs-5">R$ ${precoFormatado}</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);
        container.innerHTML = '<div class="col-12"><p class="text-secondary">O cardápio ainda não foi configurado no servidor.</p></div>';
    }
}

// ==========================================
// FUNÇÃO: CARREGAR AS AVALIAÇÕES DO JSON
// ==========================================
async function carregarAvaliacoes(id) {
    try {
        const resposta = await fetch(`${API}/avaliacoes?restauranteId=${id}`);
        const avaliacoes = await resposta.json();
        const container = document.getElementById('lista-avaliacoes');
        const resumo = document.getElementById('resumo-avaliacoes');

        container.innerHTML = '';
        
        if (avaliacoes.length === 0) {
            resumo.innerHTML = '<p class="text-muted">Ainda não há avaliações para este local. Seja o primeiro a avaliar!</p>';
            return;
        }

        // Calcula a média das notas para exibir o Resumo no topo
        const somaNotas = avaliacoes.reduce((acc, av) => acc + Number(av.nota), 0);
        const media = (somaNotas / avaliacoes.length).toFixed(1);
        
        resumo.innerHTML = `
            <div class="d-flex align-items-center gap-3 bg-light p-3 rounded-4 border">
                <h2 class="display-4 fw-black text-dark mb-0">${media}</h2>
                <div>
                    <div class="text-warning fs-5">
                        ${'<i class="bi bi-star-fill"></i>'.repeat(Math.round(media))}
                    </div>
                    <span class="text-secondary small fw-medium">Baseado em ${avaliacoes.length} avaliação(ões)</span>
                </div>
            </div>
        `;

        // Renderiza cada avaliação individualmente
        avaliacoes.forEach(av => {
            const div = document.createElement('div');
            div.className = 'card border border-light shadow-sm rounded-4 p-4 mb-3';
            
            let estrelasHTML = '<i class="bi bi-star-fill text-warning me-1"></i>'.repeat(Number(av.nota));
            let tagsHTML = '';
            
            // Se existirem tags de feedback
            if (av.tags && av.tags.length > 0) {
                tagsHTML = av.tags.map(t => `<span class="badge bg-primary-subtle text-primary border border-primary-subtle me-2 rounded-pill">${t}</span>`).join('');
            }

            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>${estrelasHTML}</div>
                    <span class="badge bg-dark text-white rounded-pill"><i class="bi bi-person-fill"></i> Usuário</span>
                </div>
                <p class="mb-3 text-secondary fw-medium">"${av.comentario}"</p>
                <div>${tagsHTML}</div>
            `;
            container.appendChild(div);
        });

    } catch (erro) {
        console.error("Erro ao carregar avaliações:", erro);
        document.getElementById('lista-avaliacoes').innerHTML = '<p class="text-danger">Não foi possível carregar os depoimentos.</p>';
    }
}