
let gridRestaurantes = document.querySelector('.restaurant-grid');


let chaveAPI = 'AIzaSyB8bt11rH31kLzRURtSyIIofrotNQhvkU8';
let termoDeBusca = 'restaurantes em Belo Horizonte';

let urlDaApi = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurantes com acessibilidade em Belo Horizonte &key= AIzaSyB8bt11rH31kLzRURtSyIIofrotNQhvkU8';

function carregarRestaurantes() {
    
    fetch(urlDaApi)
        .then(function(resposta) {
         
            return resposta.json();
        })
        .then(function(dados) {
            
        
            gridRestaurantes.innerHTML = '';

            let lista = dados.results;
            for (let i = 0; i < lista.length; i++) {
                
                let restaurante = lista[i];
                
                let nome = restaurante.name;
                let nota = restaurante.rating;
                let endereco = restaurante.formatted_address;
              
                let cardHTML = `
                    <div class="restaurant-card">
                        <div class="card-body">
                            <h2 class="restaurant-name">${nome}</h2>
                            <div class="rating-badge">Nota ${nota}/5 <span class="stars">★★★★★</span></div>
                            <p class="restaurant-desc">
                                Estabelecimento encontrado através do Google Places.
                            </p>
                            <div class="location">📍 ${endereco}</div>
                            
                            <a href="#" class="btn-details">Ver Detalhes</a>
                        </div>
                    </div>
                `;
                
                gridRestaurantes.innerHTML = gridRestaurantes.innerHTML + cardHTML;
            }
        })
        .catch(function(erro) {
            console.log("Ocorreu um erro ao buscar os dados: ", erro);
        });
}


carregarRestaurantes();