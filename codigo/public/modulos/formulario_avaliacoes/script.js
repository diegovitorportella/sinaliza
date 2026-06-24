const API = 'http://localhost:3000';

// ── Lê o restauranteId da URL ─────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const restauranteId = params.get('restauranteId');

// ── EVENTO 1: carregamento — ajusta header e link de voltar ──────────────────
document.addEventListener('DOMContentLoaded', async () => {
    if (restauranteId) {
        try {
            const resp = await fetch(`${API}/restaurantes/${restauranteId}`);
            if (resp.ok) {
                const restaurante = await resp.json();
                document.getElementById('titulo-pagina').textContent =
                    `Avaliar: ${restaurante.nome}`;
                document.getElementById('subtitulo-pagina').textContent =
                    `${restaurante.tipoCozinha} · ${restaurante.cidade}`;
                document.getElementById('link-voltar').href =
                    `../detalhes/index.html?restauranteId=${restauranteId}`;
            }
        } catch (e) {
            console.warn('Não foi possível carregar o nome do restaurante.');
        }
    } else {
        document.getElementById('subtitulo-pagina').textContent =
            'Restaurante não identificado';
    }
});

// ── EVENTO 2: tags rápidas (toggle) ──────────────────────────────────────────
const tagButtons = document.querySelectorAll('.tag-btn');
const commentTextarea = document.getElementById('comment');

tagButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        const tag = btn.dataset.tag;
        btn.classList.toggle('active');

        const current = commentTextarea.value;
        if (btn.classList.contains('active')) {
            commentTextarea.value = current ? current.trimEnd() + ', ' + tag : tag;
        } else {
            const pattern = new RegExp('(,\\s*)?' + escapeRegex(tag) + '(\\s*,)?', 'g');
            commentTextarea.value = commentTextarea.value
                .replace(pattern, (match, before, after) => (before && after) ? ',' : '')
                .replace(/^,\s*/, '')
                .replace(/,\s*$/, '')
                .trim();
        }
    });
});

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── EVENTO 3: submit do formulário — POST ao JSON Server ─────────────────────
document.getElementById('feedbackForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const ratingSelected = document.querySelector('input[name="rating"]:checked');
    const commentText = commentTextarea.value.trim();

    if (!ratingSelected) {
        alert('Por favor, selecione uma nota em estrelas.');
        return;
    }

    const activeTags = Array.from(tagButtons)
        .filter(b => b.classList.contains('active'))
        .map(b => b.dataset.tag);

    let usuarioId = null;
    try {
        const respSessao = await fetch(`${API}/sessao/atual`);
        const sessaoAtual = await respSessao.json();
        usuarioId = sessaoAtual ? sessaoAtual.usuarioId : null;
    } catch (e) {
        console.warn('Não foi possível identificar o usuário da sessão.');
    }

    const avaliacao = {
        restauranteId: restauranteId ? Number(restauranteId) : null,
        nota:          Number(ratingSelected.value),
        tags:          activeTags,
        comentario:    commentText,
        usuarioId:     usuarioId
    };
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const resp = await fetch(`${API}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avaliacao)
        });

        if (!resp.ok) throw new Error('Erro na resposta do servidor');

        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = '✓ Avaliação enviada com sucesso! Obrigado.';
        messageDiv.className = 'success-msg';
        messageDiv.classList.remove('hidden');

        document.getElementById('feedbackForm').reset();
        tagButtons.forEach(b => b.classList.remove('active'));

        if (restauranteId) {
            setTimeout(() => {
                window.location.href = `../detalhes/index.html?restauranteId=${restauranteId}`;
            }, 2000);
        }

    } catch (e) {
        console.error('Erro ao enviar avaliação:', e);
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = '✗ Erro ao enviar. Verifique se o JSON Server está rodando.';
        messageDiv.className = 'error-msg';
        messageDiv.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Avaliação';
    }
});