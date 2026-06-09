let restaurantesData = [];

// EVENTO 1: Carregar os dados ao abrir a página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resposta = await fetch('http://localhost:3000/restaurantes');
        restaurantesData = await resposta.json();
        renderizarCards(restaurantesData);
    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        document.getElementById('lista-restaurantes').innerHTML = '<p style="text-align: center; color: red;">Erro ao carregar restaurantes do servidor.</p>';
    }
});

// Função que desenha os cards mantendo o design do Gustavo
function renderizarCards(lista) {
    const container = document.getElementById('lista-restaurantes');
    container.innerHTML = ''; // Limpa a tela

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum restaurante encontrado.</p>';
        return;
    }

    lista.forEach(restaurante => {
        const article = document.createElement('article');
        article.className = 'card';
        article.tabIndex = 0;

        // Verifica se o restaurante tem libras para exibir o selinho dele
        let seloLibras = '';
        if (restaurante.checklist && restaurante.checklist.comunicacao && restaurante.checklist.comunicacao.libras) {
            seloLibras = `
                <div class="badge-libras" aria-label="Atendimento em LIBRAS disponível" style="color: var(--primary); font-weight: bold; margin-bottom: 0.5rem;">
                    <span class="icon">🤟</span> LIBRAS
                </div>
            `;
        }

        let fotoUrl = (restaurante.foto && restaurante.foto.length > 15) ? restaurante.foto : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';

        // PASSAGEM DE BASTÃO: O onclick no botão chama a função irParaDetalhes passando o ID
        article.innerHTML = `
            <img src="${fotoUrl}" alt="Fachada do Restaurante ${restaurante.nome}" class="card-image">
            <div class="card-content">
                ${seloLibras}
                <h3 class="card-title">${restaurante.nome}</h3>
                <p class="card-description">
                    <strong>${restaurante.tipoCozinha}</strong> <br>
                    📍 ${restaurante.cidade} <br>
                    ⭐ Nota de Acessibilidade: ${restaurante.pontuacaoAcessibilidade}/10
                </p>
                <button class="btn-action" aria-label="Ver detalhes do ${restaurante.nome}" onclick="irParaDetalhes(${restaurante.id})">Ver Detalhes</button>
            </div>
        `;

        container.appendChild(article);
    });
}

function irParaDetalhes(id) {
    // Usando aspas normais e concatenação para evitar qualquer erro de crase
    window.location.href = "../detalhes/index.html?id=" + id;
}

// EVENTO 2: Barra de pesquisa interativa
document.getElementById('inputBusca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    // Filtra por nome, cidade ou tipo de cozinha
    const filtrados = restaurantesData.filter(restaurante => 
        restaurante.nome.toLowerCase().includes(termo) ||
        restaurante.cidade.toLowerCase().includes(termo) ||
        restaurante.tipoCozinha.toLowerCase().includes(termo)
    );
    
    renderizarCards(filtrados);
});