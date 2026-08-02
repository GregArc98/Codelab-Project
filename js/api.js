// Configurações base da API
const BASE_URL = "https://api.balldontlie.io/v1";
const API_KEY = "55698169-4111-4a7f-af89-35c577aad50b"; 

// Busca o jogador que o usuário digitou no input
async function buscarJogadorPorNome(nome) {
    try {
        const url = `${BASE_URL}/players?search=${nome}`;
        
        // Faz a requisição para a API enviando a chave de autorização
        const resposta = await fetch(url, {
            method: "GET",
            headers: { "Authorization": API_KEY }
        });
        
        // Verifica se a comunicação com o servidor falhou
        if (!resposta.ok) throw new Error("Erro na requisição por nome");
        
        // Converte a resposta do servidor para JSON
        const dados = await resposta.json();
        
        // Compara a lista da API com o nome completo que o usuário digitou
        const jogadorExato = dados.data.find(j => 
            `${j.first_name} ${j.last_name}`.toLowerCase() === nome.toLowerCase()
        );

        // Retorna estritamente o jogador exato ou nulo se não achar
        return jogadorExato || null; 
    } catch (erro) {
        // Registra no console caso algo dê errado e impede o jogo de travar
        console.error("Falha ao buscar chute:", erro);
        return null;
    }
}

// Busca o gabarito direto pelo ID
async function buscarJogadorPorId(id) {
    try {
        // Monta a URL focada apenas no ID específico do jogador sorteado
        const url = `${BASE_URL}/players/${id}`;
        
        // Faz a requisição para a API enviando a chave de autorização
        const resposta = await fetch(url, {
            method: "GET",
            headers: { "Authorization": API_KEY }
        });
        
        // Verifica se a comunicação com o servidor falhou
        if (!resposta.ok) throw new Error("Erro na requisição por ID");
        
        // Converte a resposta do servidor para JSON
        const dados = await resposta.json();
        return dados.data; // Retorna o objeto do jogador diretamente
    } catch (erro) {
        // Registra no console caso algo dê errado e impede o jogo de travar
        console.error("Falha ao buscar gabarito:", erro);
        return null;
    }
}