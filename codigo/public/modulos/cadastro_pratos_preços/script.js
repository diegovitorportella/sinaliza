const form = document.getElementById("formPrato");
const nomePrato = document.getElementById("nomePrato");
const precoPrato = document.getElementById("precoPrato");
const categoriaPrato = document.getElementById("categoriaPrato");
const descricaoPrato = document.getElementById("descricaoPrato");
const btnGerarDescricao = document.getElementById("btnGerarDescricao");
const listaPratos = document.getElementById("listaPratos");
const mensagem = document.getElementById("mensagem");

let pratos = [];

btnGerarDescricao.addEventListener("click", function() {
  const nome = nomePrato.value.trim();
  const categoria = categoriaPrato.value;

  if (nome === "" || categoria === "") {
    mostrarMensagem("Informe o nome e a categoria para gerar a descrição.", "erro");
    return;
  }

  descricaoPrato.value = gerarDescricaoIA(nome, categoria);
  mostrarMensagem("Descrição gerada! Você pode editar antes de cadastrar.", "sucesso");
});

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const nome = nomePrato.value.trim();
  const preco = Number(precoPrato.value);
  const categoria = categoriaPrato.value;
  const descricao = descricaoPrato.value.trim();

  if (nome === "" || preco <= 0 || categoria === "") {
    mostrarMensagem("Preencha todos os campos corretamente.", "erro");
    return;
  }

  const prato = {
    nome: nome,
    preco: preco,
    categoria: categoria,
    descricao: descricao === "" ? gerarDescricaoIA(nome, categoria) : descricao
  };

  pratos.push(prato);

  mostrarMensagem("✓ Prato cadastrado com sucesso!", "sucesso");
  limparCampos();
  mostrarPratos();
});

function gerarDescricaoIA(nome, categoria) {
  if (categoria === "Entrada") {
    return `${nome} é uma opção leve e saborosa para iniciar a refeição, preparada para abrir o apetite com equilíbrio e qualidade.`;
  }

  if (categoria === "Prato Principal") {
    return `${nome} é um prato principal completo, pensado para oferecer sabor, boa apresentação e uma experiência marcante ao cliente.`;
  }

  if (categoria === "Sobremesa") {
    return `${nome} é uma sobremesa deliciosa, ideal para finalizar a refeição com um toque especial de sabor.`;
  }

  if (categoria === "Bebida") {
    return `${nome} é uma bebida refrescante e agradável, perfeita para acompanhar diferentes momentos da refeição.`;
  }

  return `${nome} é uma opção especial do cardápio, preparada para oferecer sabor e qualidade aos clientes.`;
}

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
        <p>${prato.descricao}</p>
        <p class="preco">Preço: R$ ${prato.preco.toFixed(2)}</p>
      </div>
    `;
  }
}

function limparCampos() {
  nomePrato.value = "";
  precoPrato.value = "";
  categoriaPrato.value = "";
  descricaoPrato.value = "";
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
}
