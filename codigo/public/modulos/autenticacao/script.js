const API_URL = 'http://localhost:3000/usuarios';

document.addEventListener('DOMContentLoaded', () => {
    
    // 0. VERIFICA A URL PARA ABRIR A ABA CORRETA AUTOMATICAMENTE
    // Se o link contiver #cadastro, aciona o clique na aba de Criar Conta
    if (window.location.hash === '#cadastro') {
        const tabCadastro = document.getElementById('cadastro-tab');
        if (tabCadastro) tabCadastro.click();
    } else {
        const tabLogin = document.getElementById('login-tab');
        if (tabLogin) tabLogin.click();
    }

    // 1. MÁSCARA DE CNPJ (Usando a biblioteca IMask inclusa no HTML)
    const cnpjInput = document.getElementById('cadastroCnpj');
    if (cnpjInput) {
        IMask(cnpjInput, { mask: '00.000.000/0000-00' });
    }

    // 2. ALTERNAR CAMPOS (Cliente vs Restaurante)
    const radiosTipo = document.querySelectorAll('input[name="tipoConta"]');
    const divCnpj = document.getElementById('divCnpj');
    const labelNome = document.getElementById('labelNome');

    radiosTipo.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'restaurante') {
                divCnpj.classList.remove('d-none');
                cadastroCnpj.setAttribute('required', 'true');
                labelNome.textContent = 'Nome do Restaurante';
            } else {
                divCnpj.classList.add('d-none');
                cadastroCnpj.removeAttribute('required');
                labelNome.textContent = 'Nome Completo';
                cnpjInput.value = ''; // Limpa o CNPJ se o utilizador voltar para a opção Cliente
            }
        });
    });

    // 3. LÓGICA DE CADASTRO (POST)
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const tipo = document.querySelector('input[name="tipoConta"]:checked').value;
            const novoUsuario = {
                nome: document.getElementById('cadastroNome').value.trim(),
                email: document.getElementById('cadastroEmail').value.trim(),
                senha: document.getElementById('cadastroSenha').value,
                tipo: tipo,
                cnpj: tipo === 'restaurante' ? document.getElementById('cadastroCnpj').value : null
            };

            try {
                // Verifica no banco se o email já existe
                const respCheck = await fetch(`${API_URL}?email=${novoUsuario.email}`);
                const existe = await respCheck.json();
                
                if (existe.length > 0) {
                    alert("Este email já está cadastrado!");
                    return;
                }

                // Salva o novo utilizador no JSON Server
                const resp = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                });

                if (resp.ok) {
                    alert("Conta criada com sucesso! Faça login para continuar.");
                    // Muda automaticamente para a aba de Login e limpa o formulário
                    document.getElementById('login-tab').click();
                    formCadastro.reset();
                    window.location.hash = '#login'; // Atualiza a URL para não voltar ao cadastro por engano
                }
            } catch (error) {
                console.error("Erro ao cadastrar:", error);
                alert("Erro de conexão com o servidor. O JSON Server está a correr?");
            }
        });
    }

    // 4. LÓGICA DE LOGIN (Substituindo o LocalStorage por JSON Server)
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const senha = document.getElementById('loginSenha').value;

            try {
                // Procura o utilizador com aquele email e senha exatos
                const resp = await fetch(`${API_URL}?email=${email}&senha=${senha}`);
                const users = await resp.json();

                if (users.length > 0) {
                    const usuarioLogado = users[0];
                    
                    // GUARDA A SESSÃO NO JSON SERVER (FIM DO LOCALSTORAGE!)
                    await fetch('http://localhost:3000/sessao/atual', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: "atual",
                            usuarioId: usuarioLogado.id,
                            nome: usuarioLogado.nome,
                            tipo: usuarioLogado.tipo
                        })
                    });

                    // Sistema de Roteamento Inteligente
                    if (usuarioLogado.tipo === 'restaurante') {
                        window.location.href = '../painel_restaurante/index.html';
                    } else {
                        window.location.href = '../../index.html'; 
                    }

                } else {
                    alert("Email ou palavra-passe incorretos.");
                }
            } catch (error) {
                console.error("Erro ao fazer login:", error);
                alert("Erro de conexão com o servidor. O JSON Server está a correr?");
            }
        });
    }
});