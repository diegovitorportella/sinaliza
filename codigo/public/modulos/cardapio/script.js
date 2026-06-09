const API = 'http://localhost:3000';

// ── Lê o restauranteId da URL ─────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const restauranteId = params.get('restauranteId');

let todosOsPratos = [];
let modoEdicao = false;

// ── EVENTO 1: carregamento ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    if (!restauranteId) {
        document.getElementById('subtitulo-pagina').textContent = 'Restaurante não identificado';
    } else {
        try {
            const resp = await fetch(`${API}/restaurantes/${restauranteId}`);
            if (resp.ok) {
                const restaurante = await resp.json();
                document.getElementById('titulo-pagina').textContent = `Cardápio: ${restaurante.nome}`;
                document.getElementById('subtitulo-pagina').textContent =
                    `${restaurante.tipoCozinha} · ${restaurante.cidade}`;
                document.getElementById('link-voltar').href =
                    `../detalhes/index.html?restauranteId=${restauranteId}`;
            }
        } catch (e) { /* falha silenciosa no header */ }
    }

    await carregarPratos();
});

// ── READ: carrega pratos do servidor ─────────────────────────────────────────
async function carregarPratos() {
    try {
        const url = restauranteId
            ? `${API}/cardapio?restauranteId=${restauranteId}`
            : `${API}/cardapio`;
        const resp = await fetch(url);
        todosOsPratos = await resp.json();
        renderizarPratos(todosOsPratos);
    } catch (e) {
        mostrarMensagem('Erro ao carregar pratos. Verifique o JSON Server.', 'erro');
    }
}

// ── Renderização da lista ─────────────────────────────────────────────────────
function renderizarPratos(lista) {
    const container = document.getElementById('listaPratos');

    if (lista.length === 0) {
        container.innerHTML = '<p class="vazio">Nenhum prato cadastrado ainda.</p>';
        return;
    }

    container.innerHTML = '';
    lista.forEach(prato => {
        const imgFallback = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
        const row = document.createElement('div');
        row.className = 'prato-row';
        row.innerHTML = `
            <img src="${prato.urlFoto || imgFallback}"
                 alt="${prato.nome}"
                 onerror="this.src='${imgFallback}'"
                 class="prato-thumb">
            <div class="prato-info">
                <div class="prato-nome">${prato.nome}</div>
                <div class="prato-meta">
                    <span class="tag-categoria">${prato.categoria || '—'}</span>
                    <span class="prato-preco">R$ ${Number(prato.preco).toFixed(2)}</span>
                </div>
                <div class="prato-desc">${prato.descricao || ''}</div>
            </div>
            <div class="prato-acoes">
                <button class="btn-editar" onclick="iniciarEdicao(${prato.id})">✏️ Editar</button>
                <button class="btn-deletar" onclick="deletarPrato(${prato.id}, '${prato.nome.replace(/'/g, "\\'")}')">🗑️ Excluir</button>
            </div>`;
        container.appendChild(row);
    });
}

// ── CREATE / UPDATE: salvar prato ─────────────────────────────────────────────
document.getElementById('btnSalvar').addEventListener('click', async () => {
    const nome       = document.getElementById('nomePrato').value.trim();
    const preco      = Number(document.getElementById('precoPrato').value);
    const categoria  = document.getElementById('categoriaPrato').value;
    const descricao  = document.getElementById('descricaoPrato').value.trim();
    const urlFoto    = document.getElementById('urlFoto').value.trim();
    const pratoIdVal = document.getElementById('pratoId').value;

    if (!nome || preco <= 0 || !categoria) {
        mostrarMensagem('Preencha nome, preço e categoria.', 'erro');
        return;
    }

    const payload = {
        restauranteId: restauranteId ? Number(restauranteId) : null,
        nome, preco, categoria, descricao, urlFoto
    };

    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.disabled = true;

    try {
        let resp;
        if (modoEdicao && pratoIdVal) {
            // UPDATE (PUT)
            resp = await fetch(`${API}/cardapio/${pratoIdVal}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, id: Number(pratoIdVal) })
            });
            mostrarMensagem('✓ Prato atualizado com sucesso!', 'sucesso');
        } else {
            // CREATE (POST)
            resp = await fetch(`${API}/cardapio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            mostrarMensagem('✓ Prato cadastrado com sucesso!', 'sucesso');
        }

        if (!resp.ok) throw new Error('Erro na resposta');

        limparFormulario();
        await carregarPratos();

    } catch (e) {
        mostrarMensagem('Erro ao salvar. Verifique o JSON Server.', 'erro');
    } finally {
        btnSalvar.disabled = false;
    }
});

// ── UPDATE: preenche o formulário com os dados do prato ──────────────────────
function iniciarEdicao(id) {
    const prato = todosOsPratos.find(p => p.id === id);
    if (!prato) return;

    modoEdicao = true;
    document.getElementById('pratoId').value        = prato.id;
    document.getElementById('nomePrato').value      = prato.nome;
    document.getElementById('precoPrato').value     = prato.preco;
    document.getElementById('categoriaPrato').value = prato.categoria;
    document.getElementById('descricaoPrato').value = prato.descricao || '';
    document.getElementById('urlFoto').value        = prato.urlFoto || '';

    document.getElementById('titulo-form').textContent = `Editando: ${prato.nome}`;
    document.getElementById('btnSalvar').textContent   = 'Salvar Alterações';
    document.getElementById('btnCancelar').classList.remove('hidden');

    // Rola para o formulário
    document.getElementById('secao-form').scrollIntoView({ behavior: 'smooth' });
}

// ── Cancelar edição ───────────────────────────────────────────────────────────
document.getElementById('btnCancelar').addEventListener('click', limparFormulario);

function limparFormulario() {
    modoEdicao = false;
    document.getElementById('pratoId').value        = '';
    document.getElementById('nomePrato').value      = '';
    document.getElementById('precoPrato').value     = '';
    document.getElementById('categoriaPrato').value = '';
    document.getElementById('descricaoPrato').value = '';
    document.getElementById('urlFoto').value        = '';

    document.getElementById('titulo-form').textContent  = 'Cadastrar novo prato';
    document.getElementById('btnSalvar').textContent    = 'Cadastrar Prato';
    document.getElementById('btnCancelar').classList.add('hidden');
}

// ── DELETE: excluir prato ─────────────────────────────────────────────────────
async function deletarPrato(id, nome) {
    if (!confirm(`Excluir "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;

    try {
        const resp = await fetch(`${API}/cardapio/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Erro na resposta');
        mostrarMensagem(`✓ "${nome}" excluído com sucesso.`, 'sucesso');
        await carregarPratos();
    } catch (e) {
        mostrarMensagem('Erro ao excluir. Verifique o JSON Server.', 'erro');
    }
}

// ── EVENTO 2: gerar descrição automática ─────────────────────────────────────
document.getElementById('btnGerarDescricao').addEventListener('click', () => {
    const nome      = document.getElementById('nomePrato').value.trim();
    const categoria = document.getElementById('categoriaPrato').value;

    if (!nome || !categoria) {
        mostrarMensagem('Informe o nome e a categoria para gerar a descrição.', 'erro');
        return;
    }

    document.getElementById('descricaoPrato').value = gerarDescricao(nome, categoria);
    mostrarMensagem('Descrição gerada! Você pode editar antes de salvar.', 'sucesso');
});

function gerarDescricao(nome, categoria) {
    const modelos = {
        'Entrada':         `${nome} é uma opção leve e saborosa para iniciar a refeição com equilíbrio e qualidade.`,
        'Prato Principal': `${nome} é um prato principal completo, pensado para oferecer sabor e uma experiência marcante.`,
        'Massa':           `${nome} é uma massa preparada com ingredientes frescos e selecionados, servida na temperatura ideal.`,
        'Hambúrguer':      `${nome} é um hambúrguer artesanal com ingredientes frescos e montagem especial.`,
        'Sobremesa':       `${nome} é uma sobremesa deliciosa, ideal para finalizar a refeição com um toque especial.`,
        'Bebida':          `${nome} é uma bebida refrescante, perfeita para acompanhar qualquer momento da refeição.`,
        'Acompanhamento':  `${nome} é um acompanhamento crocante e saboroso para complementar seu prato.`,
        'Combinado':       `${nome} é um combinado especial com seleção de itens variados para uma experiência completa.`,
    };
    return modelos[categoria] || `${nome} é uma opção especial do cardápio, preparada com cuidado e qualidade.`;
}

// ── EVENTO 3: filtro em tempo real (oninput) ──────────────────────────────────
document.getElementById('inputBusca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = todosOsPratos.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        (p.categoria || '').toLowerCase().includes(termo)
    );
    renderizarPratos(filtrados);
});

// ── Utilitários ───────────────────────────────────────────────────────────────
function mostrarMensagem(texto, tipo) {
    const el = document.getElementById('mensagem');
    el.textContent = texto;
    el.className = `mensagem ${tipo}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}