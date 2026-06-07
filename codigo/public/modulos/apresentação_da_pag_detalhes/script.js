
const gridRestaurantes = document.querySelector('.restaurant-grid');
const searchInput = document.querySelector('.search-input'); 

//Por enquanto sem a API do cadastro fiz meu propio banco de dados.
const restaurantesMock = [
    {
        name: "Outback Steakhouse",
        rating: 4.8,
        formatted_address: "Shopping Cidade - R. dos Tupis, 337 - Centro, Belo Horizonte"
    },
    {
        name: "Pizzaria Margherita",
        rating: 3.5, // Nota intermediária (Amarelo)
        formatted_address: "R. Antônio de Albuquerque, 749 - Savassi, Belo Horizonte"
    },
    {
        name: "Lanchonete da Esquina",
        rating: 1.8, // Nota baixa (Vermelho)
        formatted_address: "Av. Afonso Pena, 1000 - Centro, Belo Horizonte"
    },
    {
        name: "Coco Bambu",
        rating: 4.7,
        formatted_address: "R. Francisco Deslandes, 900 - Anchieta, Belo Horizonte"
    },
    {
        name: "Salumeria Central",
        rating: 4.5,
        formatted_address: "R. Sapucaí, 527 - Floresta, Belo Horizonte"
    }
];

let todosOsRestaurantes = restaurantesMock;

// Função que define as cores e o ícone do selo de acordo com a nota
function obterSeloAcessibilidade(nota) {
    const notaNum = parseFloat(nota);
    
  
    if (isNaN(notaNum)) {
        return { bg: '#f1f5f9', text: '#64748b', icon: '-' };
    }

    if (notaNum <= 2.9) {
        return { bg: '#fee2e2', text: '#b91c1c', icon: '✖' };
    }
 
    if (notaNum >= 3 && notaNum < 4) {
        return { bg: '#fef3c7', text: '#b45309', icon: '⚠' };
    }
   
    return { bg: '#dcfce7', text: '#15803d', icon: '✓' };
}

function renderizarRestaurantes(lista) {
    gridRestaurantes.innerHTML = '';

    if (lista.length === 0) {
        gridRestaurantes.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #64748b; margin-top: 20px;">Nenhum restaurante encontrado.</p>';
        return;
    }

    lista.forEach(restaurante => {
        const nome = restaurante.name;
        const nota = restaurante.rating ? restaurante.rating : 'N/A'; 
        const endereco = restaurante.formatted_address;
        
        const selo = obterSeloAcessibilidade(nota);
      
        const cardHTML = `
            <div class="restaurant-card">
                <div class="card-body">
                    <h2 class="restaurant-name">${nome}</h2>
                    
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                        <div class="rating-badge" style="margin-bottom: 0;">Nota ${nota}/5 <span class="stars" aria-hidden="true">★</span></div>
                        
                        <div style="display: inline-flex; align-items: center; gap: 6px; background-color: ${selo.bg}; color: ${selo.text}; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px;">
                            <span style="font-weight: bold;">${selo.icon}</span> ACESSIBILIDADE
                        </div>
                    </div>

                    <p class="restaurant-desc">
                        Estabelecimento parceiro com acessibilidade verificada.
                    </p>
                    <div class="location" title="${endereco}">📍 ${endereco}</div>
                    
                    <a href="index.html" class="btn-details">Ver Detalhes</a>
                </div>
            </div>
        `;
        
        gridRestaurantes.insertAdjacentHTML('beforeend', cardHTML);
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (evento) => {
        const termoDeBusca = evento.target.value.toLowerCase();
        
        const restaurantesFiltrados = todosOsRestaurantes.filter(restaurante => {
            return restaurante.name.toLowerCase().includes(termoDeBusca) || 
                   restaurante.formatted_address.toLowerCase().includes(termoDeBusca);
        });

        renderizarRestaurantes(restaurantesFiltrados);
    });


let restaurantes = [
    {
        id: 1,
        nome: "Outback Steakhouse",
        descricao: "Um ambiente aconchegante que se destaca pelo atendimento inclusivo. Nossa equipe é treinada para garantir a melhor experiência para todos.",
        localizacao: "Shopping Cidade",
        recursos: [
            "Atendimento 100% em LIBRAS",
            "Cardápio digital em vídeo com intérprete",
            "Ambiente com boa iluminação visual",
            "Avisos visuais para chamadas de mesa"
        ],
        avaliacoes: [5, 5, 4] // Notas base para cálculo da média
    },
    {
        id: 2,
        nome: "Pizzaria Margherita",
        descricao: "Tradicional pizzaria com amplo espaço térreo e rampas de acesso projetadas para cadeirantes.",
        localizacao: "Av. Paulista, 1200",
        recursos: [
            "Rampas de acesso e banheiros adaptados",
            "Cardápio impresso em Braille",
            "Mesas com altura regulável"
        ],
        avaliacoes: [3, 2, 3]
    },
    {
        id: 3,
        nome: "Burger House",
        descricao: "Lanchonete moderna focada em fast food rápido mas peca em alguns quesitos de espaço.",
        localizacao: "Rua das Flores, 45",
        recursos: [
            "Cardápio com fonte ampliada"
        ],
        avaliacoes: [2, 1]
    }
];

// Elementos DOM
const gridDeRestaurantes = document.getElementById('restaurant-grid');
const campoDeBusca = document.getElementById('search-input');
const secaoDetalhes = document.getElementById('details-section');
const btnFecharDetalhes = document.getElementById('close-details');

// Estado da aplicação
let restauranteSelecionado = null;
let notaSelecionadaNoForm = 0;

// Inicialização
function init() {
    renderizarLista(restaurantes);
    configurarEventos();

}

// Renderiza a lista de cards baseada no filtro
function renderizarLista(lista) {
    gridDeRestaurantes.innerHTML = "";
    
    if (lista.length === 0) {
        gridDeRestaurantes.innerHTML = "<p class='description-text'>Nenhum restaurante encontrado.</p>";
        return;
    }


renderizarRestaurantes(todosOsRestaurantes);

    lista.forEach(restaurante => {
        let media = calcularMedia(restaurante.avaliacoes);
        let estrelasStr = "★".repeat(Math.round(media)) + "☆".repeat(5 - Math.round(media));
        
        let card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <h3 class="restaurant-name">${restaurante.nome}</h3>
            <div>
                <span class="rating-badge">Nota ${media.toFixed(1)}/5</span>
                <span class="stars">${estrelasStr}</span>
            </div>
            <p class="restaurant-desc">${restaurante.descricao.substring(0, 90)}...</p>
            <div class="location">📍 ${restaurante.localizacao}</div>
        `;
        
        card.addEventListener('click', () => exibirDetalhes(restaurante));
        gridDeRestaurantes.appendChild(card);
    });
}


function calcularMedia(notas) {
    if (notas.length === 0) return 0;
    let soma = notas.reduce((acc, nota) => acc + nota, 0);
    return soma / notas.length;
}

function obterConfiguracaoSelo(nota) {
    let notaArredondada = Math.round(nota);
    if (notaArredondada <= 2) {
        return { classe: 'seal-red', texto: 'SELO VERMELHO - ACESSIBILIDADE BAIXA' };
    } else if (notaArredondada === 3) {
        return { classe: 'seal-yellow', texto: 'SELO AMARELO - ACESSIBILIDADE MÉDIA' };
    } else {
        return { classe: 'seal-green', texto: 'SELO DE ACESSIBILIDADE - EXCELENTE' };
    }
}


function exibirDetalhes(restaurante) {
    restauranteSelecionado = restaurante;
    secaoDetalhes.classList.remove('hidden');
    
    let media = calcularMedia(restaurante.avaliacoes);
    let estrelasStr = "★".repeat(Math.round(media)) + "☆".repeat(5 - Math.round(media));

    document.getElementById('det-title').innerText = restaurante.nome;
    document.getElementById('det-rating-badge').innerText = `Nota ${media.toFixed(1)}/5`;
    document.getElementById('det-stars').innerText = estrelasStr;
    document.getElementById('det-description').innerText = restaurante.descricao;
    document.getElementById('det-location').innerText = restaurante.localizacao;
    
    // Atualização Condicional do Selo
    let seloConfig = obterConfiguracaoSelo(media);
    let elSelo = document.getElementById('det-seal');
    elSelo.className = `accessibility-seal ${seloConfig.classe}`;
    document.getElementById('det-seal-text').innerText = seloConfig.texto;

    // Recursos de Acessibilidade
    let containerRecursos = document.getElementById('det-resources');
    containerRecursos.innerHTML = "";
    restaurante.recursos.forEach(recurso => {
        let item = document.createElement('div');
        item.className = 'resource-item';
        item.innerHTML = `
            <span class="check-icon">✓</span>
            <span class="resource-text">${recurso}</span>
        `;
        containerRecursos.appendChild(item);
    });

    resetarFormularioAvaliacao();
}

function configurarEventos() {
    campoDeBusca.addEventListener('input', (e) => {
        let termo = e.target.value.toLowerCase();
        let filtrados = restaurantes.filter(r => 
            r.nome.toLowerCase().includes(termo) || 
            r.descricao.toLowerCase().includes(termo)
        );
        renderizarLista(filtrados);
    });

    btnFecharDetalhes.addEventListener('click', () => {
        secaoDetalhes.classList.add('hidden');
        restauranteSelecionado = null;
    });

    const estrelasInput = document.querySelectorAll('.star-input');
    estrelasInput.forEach(estrela => {
        estrela.addEventListener('click', (e) => {
            notaSelecionadaNoForm = parseInt(e.target.getAttribute('data-value'));
            atualizarEstrelasVisualizacao(notaSelecionadaNoForm);
        });
    });

    // Enviar nova avaliação
    document.getElementById('btn-submit-rating').addEventListener('click', () => {
        if (notaSelecionadaNoForm === 0) {
            alert("Por favor, selecione uma quantidade de estrelas antes de enviar!");
            return;
        }

        if (restauranteSelecionado) {
            restauranteSelecionado.avaliacoes.push(notaSelecionadaNoForm);
            
            renderizarLista(restaurantes);
            exibirDetalhes(restauranteSelecionado);
            
            alert("Avaliação enviada com sucesso! O selo foi recalculado.");
            resetarFormularioAvaliacao();
        }
    });
}

function atualizarEstrelasVisualizacao(valor) {
    const estrelasInput = document.querySelectorAll('.star-input');
    estrelasInput.forEach(estrela => {
        let estrelaValor = parseInt(estrela.getAttribute('data-value'));
        if (estrelaValor <= valor) {
            estrela.classList.add('active');
        } else {
            estrela.classList.remove('active');
        }
    });
}

function resetarFormularioAvaliacao() {
    notaSelecionadaNoForm = 0;
    atualizarEstrelasVisualizacao(0);
}

init();

