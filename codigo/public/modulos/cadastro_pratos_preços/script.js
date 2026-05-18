const form = document.getElementById("formPrato");
const nomePrato = document.getElementById("nomePrato");
const precoPrato = document.getElementById("precoPrato");
const categoriaPrato = document.getElementById("categoriaPrato");
const listaPratos = document.getElementById("listaPratos");
const mensagem = document.getElementById("mensagem");

let pratos = [];

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const nome = nomePrato.value.trim();
  const preco = Number(precoPrato.value);
  const categoria = categoriaPrato.value;

  if (nome === "" || preco <= 0 || categoria === "") {
    mostrarMensagem("Preencha todos os campos corretamente.", "erro");
    return;
  }

  const prato = {
    nome: nome,
    preco: preco,
    categoria: categoria
  };

  pratos.push(prato);

  mostrarMensagem("✓ Prato cadastrado com sucesso!", "sucesso");
  limparCampos();
  mostrarPratos();
});

function mostrarPratos() {
  listaPratos.innerHTML = "";

  if (pratos.length === 0) {
    listaPratos.innerHTML = `<p class="vazio">Nenhum prato cadastrado ainda.</p>`;
    return;
  }

  for (let i = 0; i < pratos.length; i++) {
    const prato = pratos[i];

    listaPratos.innerHTML += `
      <div class="prato">
        <h3>${prato.nome}</h3>
        <p>Categoria: ${prato.categoria}</p>
        <p class="preco">Preço: R$ ${prato.preco.toFixed(2)}</p>
      </div>
    `;
  }
}

function limparCampos() {
  nomePrato.value = "";
  precoPrato.value = "";
  categoriaPrato.value = "";
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
}