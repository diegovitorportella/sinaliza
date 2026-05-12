let frasesData = [];
let categoriaAtual = 'Todas';

document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
    carregarFrases();
});

async function carregarCategorias() {
    try {
        const response = await fetch('http://localhost:3000/categorias_garcom');
        const categorias = await response.json();
        const container = document.getElementById('containerCategorias');

        const btnTodas = document.querySelector('[data-categoria="Todas"]');
        btnTodas.addEventListener('click', () => {
            mudarCorBotao(btnTodas);
            categoriaAtual = 'Todas';
            filtrarFrases();
        });

        categorias.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary rounded-pill px-4 text-nowrap btn-categoria';
            btn.setAttribute('data-categoria', cat.nome);
            btn.innerHTML = `${cat.icone} ${cat.nome}`;
            
            btn.addEventListener('click', () => {
                mudarCorBotao(btn);
                categoriaAtual = cat.nome;
                filtrarFrases();
            });

            container.appendChild(btn);
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

function mudarCorBotao(botaoClicado) {
    document.querySelectorAll('.btn-categoria').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
    });
    botaoClicado.classList.remove('btn-outline-primary');
    botaoClicado.classList.add('btn-primary');
}

async function carregarFrases() {
    try {
        const response = await fetch('http://localhost:3000/frases_garcom');
        frasesData = await response.json();
        renderizarGrid(frasesData);
    } catch (error) {
        console.error("Erro ao carregar frases:", error);
    }
}

function renderizarGrid(frases) {
    const grid = document.getElementById('gridFrases');
    grid.innerHTML = '';

    if(frases.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted mt-4">Nenhuma frase encontrada.</div>';
        return;
    }

    frases.forEach(frase => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4 col-lg-3';
        
        div.innerHTML = `
            <div class="card h-100 card-frase shadow-sm rounded-4">
                <div class="card-body text-center d-flex flex-column justify-content-center">
                    <div class="icone-grande mb-2">${frase.icone}</div>
                    <h6 class="card-title fw-semibold text-dark">${frase.texto}</h6>
                </div>
            </div>
        `;
        
        grid.appendChild(div);
    });
}

function filtrarFrases() {
    const termoPesquisa = document.getElementById('inputPesquisa').value.toLowerCase();
    
    const frasesFiltradas = frasesData.filter(frase => {
        const bateCategoria = categoriaAtual === 'Todas' || frase.categoria === categoriaAtual;
        const bateTexto = frase.texto.toLowerCase().includes(termoPesquisa);
        return bateCategoria && bateTexto;
    });

    renderizarGrid(frasesFiltradas);
}

document.getElementById('inputPesquisa').addEventListener('input', filtrarFrases);