const API_RESTAURANTES = 'http://localhost:3000/restaurantes';
let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. GUARDA DE AUTENTICAÇÃO (Via JSON Server)
    const respSessao = await fetch('http://localhost:3000/sessao/atual');
    const sessao = await respSessao.json();
    
    if (!sessao.usuarioId) {
        alert("Acesso negado. Faça login primeiro.");
        window.location.href = '../autenticacao/index.html';
        return;
    }
    
    usuarioLogado = { id: sessao.usuarioId, nome: sessao.nome, tipo: sessao.tipo };

    // Verifica se é tipo "restaurante"
    if (usuarioLogado.tipo !== 'restaurante') {
        alert("Acesso restrito para contas de Restaurante.");
        window.location.href = '../../index.html';
        return;
    }

    document.getElementById('nomeUsuarioLogado').textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}`;
    await carregarPerfilRestaurante();
});

async function carregarPerfilRestaurante() {
    try {
        const resp = await fetch(`${API_RESTAURANTES}?usuarioId=${usuarioLogado.id}`);
        const dados = await resp.json();

        if (dados.length > 0) {
            const rest = dados[0];
            document.getElementById('restauranteId').value = rest.id;
            
            document.getElementById('nomeRest').value = rest.nome || '';
            document.getElementById('especialidadeRest').value = rest.culinaria || '';
            document.getElementById('fotoRest').value = rest.urlFoto || '';
            document.getElementById('enderecoRest').value = rest.endereco || '';
            document.getElementById('cidadeRest').value = rest.cidade || '';
            
            if(rest.coordenadas) {
                document.getElementById('latRest').value = rest.coordenadas.lat || '';
                document.getElementById('lngRest').value = rest.coordenadas.lng || '';
            }

            const acess = rest.acessibilidade || [];
            document.getElementById('chkLibras').checked = acess.includes('LIBRAS');
            document.getElementById('chkBraille').checked = acess.includes('Braille');
            document.getElementById('chkRampa').checked = acess.includes('Rampa');
            document.getElementById('chkVisual').checked = acess.includes('Sinalização Visual');
        }
    } catch (error) {
        console.error("Erro ao carregar dados do restaurante:", error);
    }
}

// LÓGICA DO BOTÃO CARDÁPIO
document.getElementById('btnTabCardapio').addEventListener('click', () => {
    const rId = document.getElementById('restauranteId').value;
    if(rId) {
        window.location.href = `../cadastro_pratos_precos/index.html?restauranteId=${rId}`;
    } else {
        alert("Por favor, guarde o perfil do restaurante na aba 1 e 2 antes de acessar o cardápio.");
    }
});

// LÓGICA DO BOTÃO VER PÁGINA PÚBLICA
document.getElementById('btnVerPagina').addEventListener('click', () => {
    const rId = document.getElementById('restauranteId').value;
    if(rId) {
        window.location.href = `../detalhes/index.html?restauranteId=${rId}`;
    } else {
        alert("Você precisa guardar o perfil do restaurante primeiro para gerar a página pública.");
    }
});

// 3. LÓGICA DE SALVAR/ATUALIZAR (SUBMIT)
document.getElementById('formRestaurante').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeRest = document.getElementById('nomeRest').value.trim();
    const especialidadeRest = document.getElementById('especialidadeRest').value;
    const enderecoRest = document.getElementById('enderecoRest').value.trim();
    const latRest = document.getElementById('latRest').value;
    const lngRest = document.getElementById('lngRest').value;

    if (!nomeRest || !especialidadeRest || !enderecoRest || !latRest || !lngRest) {
        alert("Atenção: Por favor, volte à aba '1. Perfil e Localização' e preencha todos os campos obrigatórios antes de guardar.");
        return; 
    }

    const restId = document.getElementById('restauranteId').value;
    
    let facilidades = [];
    if(document.getElementById('chkLibras').checked) facilidades.push('LIBRAS');
    if(document.getElementById('chkBraille').checked) facilidades.push('Braille');
    if(document.getElementById('chkRampa').checked) facilidades.push('Rampa');
    if(document.getElementById('chkVisual').checked) facilidades.push('Sinalização Visual');

    const nota = facilidades.length > 0 ? 5 + (facilidades.length * 1.25) : 4;

    const dadosRestaurante = {
        usuarioId: usuarioLogado.id, 
        nome: nomeRest,
        culinaria: especialidadeRest,
        endereco: enderecoRest,
        cidade: document.getElementById('cidadeRest').value.trim(),
        urlFoto: document.getElementById('fotoRest').value.trim() || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        pontuacaoAcessibilidade: parseFloat(nota.toFixed(1)),
        coordenadas: {
            lat: parseFloat(latRest),
            lng: parseFloat(lngRest)
        },
        acessibilidade: facilidades,
        cardapio: [] 
    };

    try {
        let url = API_RESTAURANTES;
        let metodo = 'POST'; 

        if (restId) {
            url = `${API_RESTAURANTES}/${restId}`;
            metodo = 'PUT'; 
        }

        const resp = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosRestaurante)
        });

        if (resp.ok) {
            alert("Perfil do restaurante guardado com sucesso! Já está visível na plataforma.");
            await carregarPerfilRestaurante(); 
        }
    } catch (error) {
        console.error("Erro ao guardar restaurante:", error);
        alert("Ocorreu um erro de conexão ao tentar guardar.");
    }
});

async function fazerLogout() {
    await fetch('http://localhost:3000/sessao/atual', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: "atual", usuarioId: null, nome: null, tipo: null })
    });
    window.location.href = '../../index.html';
}