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
}


renderizarRestaurantes(todosOsRestaurantes);