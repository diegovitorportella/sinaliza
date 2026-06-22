const form = document.getElementById("restaurante");

const nomeRestaurante = document.getElementById("nomeRestaurante");
const cnpjRestaurante = document.getElementById("cnpjRestaurante");
const senhaRestaurante = document.getElementById("senhaRestaurante");
const estadoRestaurante = document.getElementById("estadoRestaurante");
const cidadeRestaurante = document.getElementById("cidadeRestaurante");
const enderecoRestaurante = document.getElementById("enderecoRestaurante");

const mensagem = document.getElementById("mensagem");

let restaurantes = [];

let cadastroConcluido = false;

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (cadastroConcluido) {
        window.location.href = "../../";
        return;
    }

    const nome = nomeRestaurante.value.trim();
    const cnpj = cnpjRestaurante.value.trim();
    const senha = senhaRestaurante.value.trim();
    const estado = estadoRestaurante.value;
    const cidade = cidadeRestaurante.value.trim();
    const endereco = enderecoRestaurante.value.trim();

    if (nome === "" || cnpj === "" || senha === "" || estado === "Selecione um estado" || cidade === "" || endereco === "") {
        mostrarMensagem("Preencha todos os campos corretamente.", "erro");
        return;
    }

    const restauranteExistente = restaurantes.find(
        r => r.cnpj === cnpj
    );

    if (restauranteExistente) {
        mostrarMensagem("Já existe um restaurante cadastrado com esse CNPJ.", "erro");
        return;
    }

    if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj)) {
        mostrarMensagem("Digite um CNPJ válido.", "erro");
        return;
    }

    const senhaValida = /^[a-zA-Z0-9@]+$/;

    if (!senhaValida.test(senha)) {
        mostrarMensagem("A senha só pode conter letras, números e @.", "erro");
        return;
    }

    if (
        !/^[A-ZÀ-Ú][a-zà-ú]+(\s(?:[A-ZÀ-Ú][a-zà-ú]+|de|da|do|das|dos))*$/.test(cidade)) {
        mostrarMensagem("Digite a cidade com letras maiúsculas corretamente.", "erro");
        return;
    }

    if (!/^[A-ZÀ-Ú][a-zà-úA-ZÀ-Ú\s]+,\s\d+\s-\s[A-ZÀ-Úa-zà-úA-ZÀ-Ú\s]+$/.test(endereco)) {
        mostrarMensagem("Digite o endereço no formato: Rua das Flores, 123 - Bairro.", "erro");
        return;
    }

    const restaurante = {
        nome: nome,
        cnpj: cnpj,
        senha: senha,
        estado: estado,
        cidade: cidade,
        endereco: endereco
    };

    restaurantes.push(restaurante);

    console.log(restaurante);

    const botao = document.getElementById("botaoCadastro");

    mostrarMensagem("✓ Restaurante cadastrado com sucesso!", "sucesso");

    botao.textContent = "Voltar";
    limparCampos();
    cadastroConcluido = true;
});

function limparCampos() {
    nomeRestaurante.value = "";
    cnpjRestaurante.value = "";
    senhaRestaurante.value = "";
    estadoRestaurante.value = "";
    cidadeRestaurante.value = "";
    enderecoRestaurante.value = "";
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.style.display = "block";

    if (tipo === "sucesso") {
        mensagem.style.backgroundColor = "#dcfce7";
        mensagem.style.color = "#166534";
    } else {
        mensagem.style.backgroundColor = "#fee2e2";
        mensagem.style.color = "#991b1b";
    }
}