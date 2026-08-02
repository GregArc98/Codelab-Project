// Array com IDs de superestrelas da NBA para o gabarito
const listaIdsGabarito = [
    79, 115, 140, 192, 237
]; 
let jogadorGabarito = null;
const idsChutados = []; // Array para guardar os jogadores já tentados
let jogoEncerrado = false;

// Elementos do DOM
const inputBusca = document.getElementById("inputBusca");
const btnBuscar = document.getElementById("btnBuscar");
const tabelaBody = document.getElementById("tabelaBody");
const mensagemContainer = document.getElementById("mensagemContainer");

// Exibe mensagem de feedback na tela
function exibirMensagem(texto, tipo = "") {
    if (!mensagemContainer) return;
    mensagemContainer.textContent = texto;
    mensagemContainer.className = tipo;
}

// Converte string de altura (ex: "6-6") para total de polegadas para comparar
function parseAltura(alturaStr) {
    if (!alturaStr || typeof alturaStr !== "string" || !alturaStr.includes("-")) return null;
    const partes = alturaStr.split("-");
    const pes = parseInt(partes[0]);
    const polegadas = parseInt(partes[1]);
    if (isNaN(pes) || isNaN(polegadas)) return null;
    return pes * 12 + polegadas;
}

// Comparação de texto exato (ex: Time, Conferência, Divisão)
function compararTexto(chute, alvo) {
    if (!chute || !alvo) return "errada";
    return chute.toLowerCase() === alvo.toLowerCase() ? "correta" : "errada"; 
}

// Comparação de posição (suporta exato e parcial, ex: G vs G-F)
function compararPosicao(chute, alvo) {
    if (!chute || !alvo) return "errada";
    if (chute.toLowerCase() === alvo.toLowerCase()) return "correta";
    
    const posChute = chute.split("-");
    const posAlvo = alvo.split("-");
    const temSobreposicao = posChute.some(p => posAlvo.includes(p));
    
    return temSobreposicao ? "parcial" : "errada";
}

// Comparação de altura (retorna classe e seta de dica ⬆️/⬇️)
function compararAltura(chuteStr, alvoStr) {
    const altChute = parseAltura(chuteStr);
    const altAlvo = parseAltura(alvoStr);
    
    if (altChute === null || altAlvo === null) {
        return { status: "errada", seta: "" };
    }
    if (altChute === altAlvo) {
        return { status: "correta", seta: "" };
    }
    return {
        status: "errada",
        seta: altChute > altAlvo ? "⬇️" : "⬆️"
    };
}

// Comparação de números (Ano de Draft e Número da Camisa)
function compararNumero(chute, alvo) {
    if (chute === null || chute === undefined || alvo === null || alvo === undefined) {
        return { status: "errada", seta: "" };
    }
    const numChute = parseInt(chute);
    const numAlvo = parseInt(alvo);
    
    if (isNaN(numChute) || isNaN(numAlvo)) {
        return { status: "errada", seta: "" };
    }
    if (numChute === numAlvo) {
        return { status: "correta", seta: "" };
    }
    return {
        status: "errada",
        seta: numChute > numAlvo ? "⬇️" : "⬆️"
    };
}

// Função que roda logo que o site abre
async function iniciarJogo() {
    exibirMensagem("Sorteando jogador da rodada...", "");
    const idSorteado = listaIdsGabarito[Math.floor(Math.random() * listaIdsGabarito.length)];
    jogadorGabarito = await buscarJogadorPorId(idSorteado);
    
    if (jogadorGabarito) {
        exibirMensagem("", "");
    } else {
        exibirMensagem("Erro ao carregar jogador. Tente recarregar a página.", "erro");
    }
}

// Processa o chute do usuário
async function processarChute() {
    if (jogoEncerrado) return;
    
    const nomeDigitado = inputBusca.value.trim();
    if (nomeDigitado === "") return;
    
    if (!jogadorGabarito) {
        exibirMensagem("Aguarde o jogo carregar...", "erro");
        return;
    }
    
    btnBuscar.disabled = true;
    exibirMensagem("Buscando jogador...", "");
    
    const jogadorChute = await buscarJogadorPorNome(nomeDigitado);
    btnBuscar.disabled = false;
    
    if (!jogadorChute) {
        exibirMensagem("Jogador não encontrado na base de dados! Verifique o nome.", "erro");
        return;
    }

    if (idsChutados.includes(jogadorChute.id)) {
        exibirMensagem("Você já tentou esse jogador!", "erro");
        inputBusca.value = "";
        return;
    }
    
    // Limpa qualquer mensagem de erro anterior
    exibirMensagem("", "");
    idsChutados.push(jogadorChute.id);

    // Comparando todos os 8 atributos
    const timeChute = jogadorChute.team ? jogadorChute.team.abbreviation : "-";
    const timeGabarito = jogadorGabarito.team ? jogadorGabarito.team.abbreviation : "-";
    const statusTime = compararTexto(timeChute, timeGabarito);
    
    const confChute = jogadorChute.team ? jogadorChute.team.conference : "-";
    const confGabarito = jogadorGabarito.team ? jogadorGabarito.team.conference : "-";
    const statusConf = compararTexto(confChute, confGabarito);

    const divChute = jogadorChute.team ? jogadorChute.team.division : "-";
    const divGabarito = jogadorGabarito.team ? jogadorGabarito.team.division : "-";
    const statusDiv = compararTexto(divChute, divGabarito);

    const posChute = jogadorChute.position || "-";
    const posGabarito = jogadorGabarito.position || "-";
    const statusPos = compararPosicao(posChute, posGabarito);

    const altChute = jogadorChute.height || "-";
    const altGabarito = jogadorGabarito.height || "-";
    const resAltura = compararAltura(altChute, altGabarito);

    const draftChute = jogadorChute.draft_year;
    const draftGabarito = jogadorGabarito.draft_year;
    const resDraft = compararNumero(draftChute, draftGabarito);
    const textoDraft = draftChute === null || draftChute === undefined ? "ND" : draftChute;

    const camisaChute = jogadorChute.jersey_number;
    const camisaGabarito = jogadorGabarito.jersey_number;
    const resCamisa = compararNumero(camisaChute, camisaGabarito);
    const textoCamisa = camisaChute === null || camisaChute === undefined || camisaChute === "" ? "-" : camisaChute;

    // Atualiza a linha da tentativa atual na tabela (usando o índice do array idsChutados)
    const numeroTentativa = idsChutados.length;
    const linhaAtual = tabelaBody.rows[numeroTentativa - 1];

    if (linhaAtual) {
        linhaAtual.innerHTML = `
            <td class="caixa nome">${jogadorChute.first_name} ${jogadorChute.last_name}</td>
            <td class="caixa ${statusTime}">${timeChute}</td>
            <td class="caixa ${statusConf}">${confChute}</td>
            <td class="caixa ${statusDiv}">${divChute}</td>
            <td class="caixa ${statusPos}">${posChute}</td>
            <td class="caixa ${resAltura.status}">${altChute} ${resAltura.seta}</td>
            <td class="caixa ${resDraft.status}">${textoDraft} ${resDraft.seta}</td>
            <td class="caixa ${resCamisa.status}">${textoCamisa} ${resCamisa.seta}</td>
        `;
    }

    inputBusca.value = ""; // Limpa o campo para o próximo chute

    // Verifica se ganhou ou se acabaram as tentativas
    if (jogadorChute.id === jogadorGabarito.id) {
        jogoEncerrado = true;
        inputBusca.disabled = true;
        btnBuscar.disabled = true;
        exibirMensagem(`🎉 Excelente! Você acertou em ${numeroTentativa} ${numeroTentativa === 1 ? 'tentativa' : 'tentativas'}!`, "sucesso");
    } else if (idsChutados.length >= 8) {
        jogoEncerrado = true;
        inputBusca.disabled = true;
        btnBuscar.disabled = true;
        exibirMensagem(`❌ Fim de jogo! O jogador era ${jogadorGabarito.first_name} ${jogadorGabarito.last_name}.`, "erro");
    }
}

// Event Listeners
btnBuscar.addEventListener("click", processarChute);

inputBusca.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        processarChute();
    }
});

// Inicia o jogo
iniciarJogo();