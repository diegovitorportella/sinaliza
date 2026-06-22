const form = document.getElementById("Usuario");

const nomeUsuario = document.getElementById("nomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const senhaUsuario = document.getElementById("senhaUsuario");

const mensagem = document.getElementById("mensagem");

let usuarios = [];

let cadastroConcluido = false;

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (cadastroConcluido) {
    window.location.href = "../../";
    return;
}

  const nome = nomeUsuario.value.trim();
  const email = emailUsuario.value.trim();
  const senha = senhaUsuario.value.trim();

  if (nome === "" || email === "" || senha === "") {
    mostrarMensagem("Preencha todos os campos corretamente.", "erro");
    return;
  }

  const usuarioExistente = usuarios.find(
    u => u.email === email
);

if (usuarioExistente) {
    mostrarMensagem("Este e-mail já está cadastrado.", "erro");
    return;
}

  if (email.includes(" ")) {
    mostrarMensagem("O email não pode conter espaços.", "erro");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    mostrarMensagem("Digite um email válido.", "erro");
    return;
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValido.test(email)) {
    mostrarMensagem("Digite um email válido.", "erro");
    return;
  }

  const senhaValida = /^[a-zA-Z0-9@]+$/;

  if (!senhaValida.test(senha)) {
    mostrarMensagem(
      "A senha só pode conter letras, números e @.",
      "erro"
    );
    return;
  }

  const usuario = {
    nome: nome,
    email: email,
    senha: senha
  };

  usuarios.push(usuario);

  console.log(usuario);

  const botao = document.getElementById("botaoCadastro");

  mostrarMensagem("✓ Usuário cadastrado com sucesso!", "sucesso");

  botao.textContent = "Voltar";
  limparCampos();
  cadastroConcluido = true;
});

function limparCampos() {
  nomeUsuario.value = "";
  emailUsuario.value = "";
  senhaUsuario.value = "";
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