// Array com 5 IDs de superestrelas da NBA para o gabarito
const listaIdsGabarito = [
    79, 115, 140, 192, 237
]; 
let jogadorGabarito = null;
const idsChutados = []; // Array para guardar os jogadores já tentados

// Elementos do DOM
const inputBusca = document.getElementById("inputBusca");
const btnBuscar = document.getElementById("btnBuscar");
const containerTabela = document.getElementById("containerTabela"); 

// Função que roda logo que o site abre
async function iniciarJogo() {
    // Sorteia um dos IDs da nossa lista
    const idSorteado = listaIdsGabarito[Math.floor(Math.random() * listaIdsGabarito.length)];
    
    // Busca os dados dele no api.js
    jogadorGabarito = await buscarJogadorPorId(idSorteado);
}

// Regras de comparação
function compararTexto(chute, alvo) {
    return chute === alvo ? "correta" : "errada"; 
}

function compararNumero(chute, alvo) {
    if (chute === alvo) return "correta";
    // Se o usuário chutou um número maior que o alvo, a dica é descer 
    return chute > alvo ? "menor" : "maior"; 
}

// O evento de clique
btnBuscar.addEventListener("click", async () => {
    const nomeDigitado = inputBusca.value.trim();
    if (nomeDigitado === "" || !jogadorGabarito) return;
    
    // Busca os dados do chute na API
    const jogadorChute = await buscarJogadorPorNome(nomeDigitado);
    
    if (!jogadorChute) {
        // Verifica se o usuário digitou apenas uma palavra
        if (nomeDigitado.split(" ").length === 1) {
            alert("Por favor, digite o nome e o sobrenome do jogador (ex: LeBron James).");
        } else {
            alert("Jogador não encontrado na base de dados! Verifique a ortografia.");
        }
        return;
    }

    // Verifica se o ID do jogador já está na lista de chutados
    if (idsChutados.includes(jogadorChute.id)) {
        alert("Você já tentou esse jogador!");
        inputBusca.value = ""; // Limpa o campo para a próxima tentativa
        return;
    }
    
    // Adiciona o jogador na lista de tentativas 
    idsChutados.push(jogadorChute.id);

    // Comparando os atributos
    const statusTime = compararTexto(jogadorChute.team.abbreviation, jogadorGabarito.team.abbreviation);
    const statusPosicao = compararTexto(jogadorChute.position, jogadorGabarito.position);
    
    // Tratando números
    const numCamisaChute = parseInt(jogadorChute.jersey_number) || 0;
    const numCamisaGabarito = parseInt(jogadorGabarito.jersey_number) || 0;
    const statusCamisa = compararNumero(numCamisaChute, numCamisaGabarito);
    
    const anoDraftChute = parseInt(jogadorChute.draft_year) || 0;
    const anoDraftGabarito = parseInt(jogadorGabarito.draft_year) || 0;
    const statusDraft = compararNumero(anoDraftChute, anoDraftGabarito);

    // Definindo as setinhas
    const setaCamisa = statusCamisa === "maior" ? "⬆️" : statusCamisa === "menor" ? "⬇️" : "";
    const setaDraft = (jogadorChute.draft_year === null || statusDraft === "correta") ? "" : (statusDraft === "maior" ? "⬆️" : "⬇️");

    // Tratando textos vazios ou nulos da API
    const textoDraft = jogadorChute.draft_year === null ? "ND" : jogadorChute.draft_year;
    const textoPosicao = jogadorChute.position === "" ? "-" : jogadorChute.position;
    // Tratamento para camisas nulas ou vazias
    const textoCamisa = (jogadorChute.jersey_number === null || jogadorChute.jersey_number === "") ? "-" : jogadorChute.jersey_number;

    // Desenhando a nova linha na tela
    const novaLinha = document.createElement("div");
    novaLinha.style.display = "flex"; 
    novaLinha.style.gap = "10px";
    novaLinha.style.marginBottom = "10px";

    // Injetando o HTML com as classes dinâmicas e os textos tratados
    novaLinha.innerHTML = `
        <div class="caixa nome">${jogadorChute.first_name} ${jogadorChute.last_name}</div>
        <div class="caixa ${statusTime}">${jogadorChute.team.abbreviation}</div>
        <div class="caixa ${statusPosicao}">${textoPosicao}</div>
        <div class="caixa ${statusCamisa === 'correta' ? 'correta' : 'errada'}">
            ${textoCamisa} ${setaCamisa}
        </div>
        <div class="caixa ${statusDraft === 'correta' ? 'correta' : 'errada'}">
            ${textoDraft} ${setaDraft}
        </div>
    `;

    // Adiciona o chute mais recente no topo do contêiner
    containerTabela.prepend(novaLinha);
    inputBusca.value = ""; // Limpa o campo de busca

    // Checando se ganhou
    if (jogadorChute.id === jogadorGabarito.id) {
        // Pequeno delay para a linha renderizar antes do alerta
        setTimeout(() => alert("Você acertou! Fim de jogo."), 300); 
    }
});

// Dá a partida no jogo assim que o script é lido
iniciarJogo();