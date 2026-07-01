const API = 'http://localhost:3000';

const params = new URLSearchParams(window.location.search);
const restauranteId = params.get('restauranteId');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const respSessao = await fetch(`${API}/sessao`);
        const sessaoArray = await respSessao.json();
        const sessao = sessaoArray[0];

        if (!sessao || !sessao.usuarioId || sessao.tipo === 'restaurante') {
            const aviso = document.getElementById('message');
            aviso.innerHTML = '⚠️ Você precisa estar logado como cliente para enviar uma avaliação.';
            aviso.className = 'error-msg';
            aviso.classList.remove('hidden');
            document.getElementById('feedbackForm').style.display = 'none';
            setTimeout(() => {
                window.location.href = `../autenticacao/index.html`;
            }, 2500);
            return;
        }
    } catch (e) {
        console.warn('Erro ao verificar sessão.', e);
    }

    if (restauranteId) {
        try {
            const resp = await fetch(`${API}/restaurantes/${restauranteId}`);
            if (resp.ok) {
                const restaurante = await resp.json();
                document.getElementById('titulo-pagina').textContent = `Avaliar: ${restaurante.nome}`;
                document.getElementById('subtitulo-pagina').textContent = `${restaurante.tipoCozinha} · ${restaurante.cidade}`;
                document.getElementById('link-voltar').href = `../detalhes/index.html?id=${restauranteId}`;
            }
        } catch (e) {
            console.warn('Não foi possível carregar o nome do restaurante.');
        }
    } else {
        document.getElementById('subtitulo-pagina').textContent = 'Restaurante não identificado';
    }
});

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
        const respSessao = await fetch(`${API}/sessao`);
        const sessaoArray = await respSessao.json();
        usuarioId = sessaoArray[0] ? sessaoArray[0].usuarioId : null;
    }
    catch (e) {
        console.warn('Não foi possível identificar o usuário da sessão.');
    }

    if (restauranteId) {
        setTimeout(() => {
            window.location.href = `../detalhes/index.html?id=${restauranteId}`;
        }, 2000);
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const resp = await fetch(`${API}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avaliacao)
        });

        if (!resp.ok) throw new Error('Erro na resposta do servidor ao postar avaliação');

        if (idRestauranteNumerico) {
            try {
                const respTodas = await fetch(`${API}/avaliacoes?restauranteId=${idRestauranteNumerico}`);
                if (respTodas.ok) {
                    const listaAvaliacoes = await respTodas.json();

                    if (listaAvaliacoes.length > 0) {
                        const somaNotas = listaAvaliacoes.reduce((acumulador, item) => acumulador + Number(item.nota || 0), 0);
                        const novaMedia = parseFloat((somaNotas / listaAvaliacoes.length).toFixed(1));

                        await fetch(`${API}/restaurantes/${idRestauranteNumerico}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                pontuacaoAcessibilidade: novaMedia
                            })
                        });
                    }
                }
            }
            catch (erroMedia) {
                console.error('Erro ao atualizar a média do restaurante no banco:', erroMedia);
            }
        }

        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = '✓ Avaliação enviada com sucesso! Nota geral atualizada.';
        messageDiv.className = 'success-msg';
        messageDiv.classList.remove('hidden');

        document.getElementById('feedbackForm').reset();
        tagButtons.forEach(b => b.classList.remove('active'));

        if (restauranteId) {
            setTimeout(() => {
                window.location.href = `../detalhes/index.html?restauranteId=${restauranteId}`;
            }, 2000);
        }
    }
    catch (e) {
        console.error('Erro ao enviar avaliação:', e);
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = '✗ Erro ao enviar. Verifique se o JSON Server está rodando.';
        messageDiv.className = 'error-msg';
        messageDiv.classList.remove('hidden');
    }
    finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Avaliação';
    }
})