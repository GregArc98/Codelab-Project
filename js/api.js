// Configurações base da API
const BASE_URL = "https://api.balldontlie.io/v1";
const API_KEY = "55698169-4111-4a7f-af89-35c577aad50b"; 

// Busca o jogador que o usuário digitou no input
async function buscarJogadorPorNome(nome) {
    try {
        const nomeTrim = nome.trim();
        if (!nomeTrim) return null;

        const partes = nomeTrim.split(/\s+/);
        let resultados = [];

        // A API balldontlie não aceita espaços no parâmetro `search`.
        // Se o usuário digitou mais de uma palavra (ex: "LeBron James"), buscamos por first_name e last_name.
        if (partes.length > 1) {
            const primeiroNome = partes[0];
            const sobrenome = partes.slice(1).join(" ");
            
            // Tenta por first_name + last_name
            const url = `${BASE_URL}/players?first_name=${encodeURIComponent(primeiroNome)}&last_name=${encodeURIComponent(sobrenome)}`;
            const res = await fetch(url, { headers: { "Authorization": API_KEY } });
            if (res.ok) {
                const dados = await res.json();
                if (dados.data && dados.data.length > 0) {
                    resultados = dados.data;
                }
            }

            // Se não achou, tenta search pelo sobrenome
            if (resultados.length === 0) {
                const urlSobrenome = `${BASE_URL}/players?search=${encodeURIComponent(sobrenome)}`;
                const resSub = await fetch(urlSobrenome, { headers: { "Authorization": API_KEY } });
                if (resSub.ok) {
                    const dados = await resSub.json();
                    if (dados.data && dados.data.length > 0) {
                        resultados = dados.data;
                    }
                }
            }

            // Se não achou, tenta search pelo primeiro nome
            if (resultados.length === 0) {
                const urlPrimeiro = `${BASE_URL}/players?search=${encodeURIComponent(primeiroNome)}`;
                const resPrim = await fetch(urlPrimeiro, { headers: { "Authorization": API_KEY } });
                if (resPrim.ok) {
                    const dados = await resPrim.json();
                    if (dados.data && dados.data.length > 0) {
                        resultados = dados.data;
                    }
                }
            }
        } else {
            // Se o usuário digitou apenas 1 palavra
            const url = `${BASE_URL}/players?search=${encodeURIComponent(nomeTrim)}`;
            const res = await fetch(url, { headers: { "Authorization": API_KEY } });
            if (res.ok) {
                const dados = await res.json();
                if (dados.data && dados.data.length > 0) {
                    resultados = dados.data;
                }
            }

            if (resultados.length === 0) {
                const urlFirst = `${BASE_URL}/players?first_name=${encodeURIComponent(nomeTrim)}`;
                const resFirst = await fetch(urlFirst, { headers: { "Authorization": API_KEY } });
                if (resFirst.ok) {
                    const dados = await resFirst.json();
                    if (dados.data && dados.data.length > 0) {
                        resultados = dados.data;
                    }
                }
            }

            if (resultados.length === 0) {
                const urlLast = `${BASE_URL}/players?last_name=${encodeURIComponent(nomeTrim)}`;
                const resLast = await fetch(urlLast, { headers: { "Authorization": API_KEY } });
                if (resLast.ok) {
                    const dados = await resLast.json();
                    if (dados.data && dados.data.length > 0) {
                        resultados = dados.data;
                    }
                }
            }
        }

        if (resultados.length === 0) return null;

        const buscaLower = nomeTrim.toLowerCase();

        // Match por nome completo exato
        let jogadorMatch = resultados.find(j => 
            `${j.first_name} ${j.last_name}`.toLowerCase() === buscaLower
        );

        // Se não achou exato, busca por quem possui o sobrenome ou primeiro nome exato
        if (!jogadorMatch) {
            jogadorMatch = resultados.find(j => 
                j.last_name.toLowerCase() === buscaLower ||
                j.first_name.toLowerCase() === buscaLower
            );
        }

        // Se ainda não encontrou, busca por quem contém a string
        if (!jogadorMatch) {
            jogadorMatch = resultados.find(j => 
                `${j.first_name} ${j.last_name}`.toLowerCase().includes(buscaLower)
            );
        }

        return jogadorMatch || resultados[0];
    } catch (erro) {
        console.error("Falha ao buscar chute:", erro);
        return null;
    }
}

// Busca o gabarito direto pelo ID
async function buscarJogadorPorId(id) {
    try {
        const url = `${BASE_URL}/players/${id}`;
        
        const resposta = await fetch(url, {
            method: "GET",
            headers: { "Authorization": API_KEY }
        });
        
        if (!resposta.ok) throw new Error("Erro na requisição por ID");
        
        const dados = await resposta.json();
        return dados.data;
    } catch (erro) {
        console.error("Falha ao buscar gabarito:", erro);
        return null;
    }
}