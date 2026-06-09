// ==========================================
// 1. DADOS SIMULADOS (MOCK)
// ==========================================
let restaurantes = [
    {
        id: 1,
        nome: "Outback Steakhouse",
        descricao: "Um ambiente aconchegante que se destaca pelo atendimento inclusivo. Nossa equipe é treinada para garantir a melhor experiência para todos.",
        localizacao: "Shopping Cidade - Centro, Belo Horizonte",
        recursos: [
            "Atendimento 100% em LIBRAS",
            "Cardápio digital em vídeo com intérprete",
            "Ambiente com boa iluminação visual",
            "Avisos visuais para chamadas de mesa"
        ],
        avaliacoes: [5, 5, 4] // Média ~4.6 (Verde)
    },
    {
        id: 2,
        nome: "Pizzaria Margherita",
        descricao: "Tradicional pizzaria com amplo espaço térreo e rampas de acesso projetadas para cadeirantes.",
        localizacao: "R. Antônio de Albuquerque, 749 - Savassi",
        recursos: [
            "Rampas de acesso e banheiros adaptados",
            "Cardápio impresso em Braille",
            "Mesas com altura regulável"
        ],
        avaliacoes: [3, 4, 3] // Média ~3.3 (Amarelo)
    },
    {
        id: 3,
        nome: "Lanchonete da Esquina",
        descricao: "Lanchonete moderna focada em fast food rápido, mas que ainda precisa melhorar o espaço de circulação.",
        localizacao: "Av. Afonso Pena, 1000 - Centro",
        recursos: [
            "Cardápio com fonte ampliada"
        ],
        avaliacoes: [2, 1, 2] // Média ~1.6 (Vermelho)
    }
];

// ==========================================
// 2. SELEÇÃO DE ELEMENTOS DO DOM
// ==========================================
const gridDeRestaurantes = document.querySelector('.restaurant-grid');
const campoDeBusca = document.querySelector('.search-input');

// Elementos da seção de detalhes (Modal/Painel)
const secaoDetalhes = document.getElementById('details-section');
const btnFecharDetalhes = document.getElementById('close-details');
const btnEnviarAvaliacao = document.getElementById('btn-submit-rating');
const estrelasInput = document.querySelectorAll('.star-input');

// Estado da aplicação
let restauranteSelecionado = null;
let notaSelecionadaNoForm = 0;

// ==========================================
// 3. FUNÇÕES DE UTILIDADE E LÓGICA
// ==========================================

// Calcula a média das avaliações do array
function calcularMedia(notas) {
    if (!notas || notas.length === 0) return 0;
    let soma = notas.reduce((acc, nota) => acc + nota, 0);
    return soma / notas.length;
}

// Retorna as cores, ícones e textos do selo baseado na média
function obterConfiguracaoSelo(notaMedia) {
    if (isNaN(notaMedia) || notaMedia === 0) {
        return { bg: '#f1f5f9', text: '#64748b', icon: '-', label: 'SEM AVALIAÇÃO' };
    }
    if (notaMedia <= 2.9) {
        return { bg: '#fee2e2', text: '#b91c1c', icon: '✖', label: 'ACESSIBILIDADE BAIXA' };
    }
    if (notaMedia >= 3 && notaMedia < 4) {
        return { bg: '#fef3c7', text: '#b45309', icon: '⚠', label: 'ACESSIBILIDADE MÉDIA' };
    }
    return { bg: '#dcfce7', text: '#15803d', icon: '✓', label: 'ACESSIBILIDADE EXCELENTE' };
}

// ==========================================
// 4. FUNÇÕES DE RENDERIZAÇÃO (TELA)
// ==========================================

// Renderiza os cards na tela principal
function renderizarLista(lista) {
    gridDeRestaurantes.innerHTML = "";
    
    if (lista.length === 0) {
        gridDeRestaurantes.innerHTML = "<p style='text-align:center; grid-column: 1/-1; color: #64748b; margin-top: 20px;'>Nenhum restaurante encontrado.</p>";
        return;
    }

    lista.forEach(restaurante => {
        let media = calcularMedia(restaurante.avaliacoes);
        let selo = obterConfiguracaoSelo(media);
        
        // Gera visualmente as estrelas (ex: ★★★★☆)
        let estrelasPreenchidas = Math.round(media);
        let estrelasStr = "★".repeat(estrelasPreenchidas) + "☆".repeat(5 - estrelasPreenchidas);
        
        let card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="card-body">
                <h2 class="restaurant-name">${restaurante.nome}</h2>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                    <div class="rating-badge" style="margin-bottom: 0;">Nota ${media.toFixed(1)} <span class="stars">${estrelasStr}</span></div>
                    
                    <div style="display: inline-flex; align-items: center; gap: 6px; background-color: ${selo.bg}; color: ${selo.text}; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 6px;">
                        <span style="font-weight: bold;">${selo.icon}</span> ${selo.label}
                    </div>
                </div>

                <p class="restaurant-desc">${restaurante.descricao.substring(0, 90)}...</p>
                <div class="location" title="${restaurante.localizacao}">📍 ${restaurante.localizacao}</div>
                
                <button class="btn-details" style="width: 100%; margin-top: 15px; border: none; cursor: pointer;">Ver Detalhes</button>
            </div>
        `;
        
        // Ao clicar em qualquer lugar do card, abre os detalhes
        card.addEventListener('click', () => exibirDetalhes(restaurante));
        gridDeRestaurantes.appendChild(card);
    });
}

// Preenche e exibe a seção de detalhes
function exibirDetalhes(restaurante) {
    restauranteSelecionado = restaurante;
    
    // Verifica se os elementos existem antes de tentar manipulá-los
    if (!secaoDetalhes) return; 

    secaoDetalhes.classList.remove('hidden');
    
    let media = calcularMedia(restaurante.avaliacoes);
    let selo = obterConfiguracaoSelo(media);
    let estrelasPreenchidas = Math.round(media);
    let estrelasStr = "★".repeat(estrelasPreenchidas) + "☆".repeat(5 - estrelasPreenchidas);

    document.getElementById('det-title').innerText = restaurante.nome;
    document.getElementById('det-rating-badge').innerText = `Nota ${media.toFixed(1)}/5`;
    document.getElementById('det-stars').innerText = estrelasStr;
    document.getElementById('det-description').innerText = restaurante.descricao;
    document.getElementById('det-location').innerText = `📍 ${restaurante.localizacao}`;
    
    // Atualiza o selo nos detalhes
    let elSelo = document.getElementById('det-seal');
    if(elSelo) {
        elSelo.style.backgroundColor = selo.bg;
        elSelo.style.color = selo.text;
        document.getElementById('det-seal-text').innerText = `${selo.icon} ${selo.label}`;
    }

    // Renderiza os recursos de acessibilidade como lista
    let containerRecursos = document.getElementById('det-resources');
    if(containerRecursos) {
        containerRecursos.innerHTML = "";
        restaurante.recursos.forEach(recurso => {
            let item = document.createElement('div');
            item.className = 'resource-item';
            item.innerHTML = `
                <span class="check-icon" style="background-color: #2563eb; color: white; border-radius: 50%; padding: 2px 6px; font-size: 12px; margin-right: 8px;">✓</span>
                <span class="resource-text">${recurso}</span>
            `;
            containerRecursos.appendChild(item);
        });
    }

    resetarFormularioAvaliacao();
}

// ==========================================
// 5. EVENTOS E INTERAÇÕES
// ==========================================
function configurarEventos() {
    // Busca dinâmica
    if (campoDeBusca) {
        campoDeBusca.addEventListener('input', (e) => {
            let termo = e.target.value.toLowerCase();
            let filtrados = restaurantes.filter(r => 
                r.nome.toLowerCase().includes(termo) || 
                r.localizacao.toLowerCase().includes(termo)
            );
            renderizarLista(filtrados);
        });
    }

    // Fechar painel de detalhes
    if (btnFecharDetalhes) {
        btnFecharDetalhes.addEventListener('click', () => {
            secaoDetalhes.classList.add('hidden');
            restauranteSelecionado = null;
        });
    }

    // Sistema de clique nas estrelas de avaliação
    if (estrelasInput.length > 0) {
        estrelasInput.forEach(estrela => {
            estrela.addEventListener('click', (e) => {
                notaSelecionadaNoForm = parseInt(e.target.getAttribute('data-value'));
                atualizarEstrelasVisualizacao(notaSelecionadaNoForm);
            });
        });
    }

    // Enviar nova nota
    if (btnEnviarAvaliacao) {
        btnEnviarAvaliacao.addEventListener('click', () => {
            if (notaSelecionadaNoForm === 0) {
                alert("Por favor, selecione uma quantidade de estrelas antes de enviar!");
                return;
            }

            if (restauranteSelecionado) {
                // Adiciona a nova nota ao banco de dados do restaurante
                restauranteSelecionado.avaliacoes.push(notaSelecionadaNoForm);
                
                // Atualiza as telas
                renderizarLista(restaurantes);
                exibirDetalhes(restauranteSelecionado);
                
                alert("Avaliação enviada com sucesso! O selo foi recalculado.");
                resetarFormularioAvaliacao();
            }
        });
    }
}

// Atualiza visualmente quais estrelas estão "acesas" no formulário
function atualizarEstrelasVisualizacao(valor) {
    estrelasInput.forEach(estrela => {
        let estrelaValor = parseInt(estrela.getAttribute('data-value'));
        if (estrelaValor <= valor) {
            estrela.style.color = "#eab308"; // Cor ativa (Amarelo)
        } else {
            estrela.style.color = "#cbd5e1"; // Cor inativa (Cinza)
        }
    });
}

// Reseta o formulário após o envio
function resetarFormularioAvaliacao() {
    notaSelecionadaNoForm = 0;
    atualizarEstrelasVisualizacao(0);
}

// ==========================================
// 6. INICIALIZAÇÃO
// ==========================================
function init() {
    renderizarLista(restaurantes);
    configurarEventos();
}

// Roda a aplicação
init();