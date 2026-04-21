async function buscarCEP() {
    const cep = document.getElementById("cepID").value.replace(/\D/g, ""); //coletar e limpar os dados

    // Validação básica
    if (cep.length !== 8) {
        alert("CEP precisa ter 8 dígitos!");
        return;
    }

    const ValorCep = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`); //faz a busca do cep na api
    const dados = await ValorCep.json(); //transforma os dados em objetos (json)

    if (dados.street) {
        document.getElementById("resultado").innerHTML = `
        <p><strong>Cidade:</strong> ${dados.city}</p>
        <p><strong>Estado:</strong> ${dados.state}</p>
        <p><strong>Rua:</strong> ${dados.street}</p>
        <p><strong>Bairro:</strong> ${dados.neighborhood}</p>
    `;
    } else {
        document.getElementById("resultado").innerHTML = `
            <p><strong>Cidade:</strong> ${dados.city}</p>
            <p><strong>Estado:</strong> ${dados.state}</p>
        `;
    }

    // Exibe o card de resultado
    document.getElementById("resultado").classList.add("visivel");

    const endereco = dados.street
    ? `${dados.street}, ${dados.city}, ${dados.state}, Brasil` //Se tiver rua, utiliza ela
    : `${dados.city}, ${dados.state}, Brasil`; //Se não tiver, descarta o valor nulo

    const ValorGeo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`) //faz a busca do endereço na api

    const dadosGeo = await ValorGeo.json(); //transforma os dados em objetos

    if (dadosGeo.length === 0) {
        alert("Não foi possível encontrar a localização no mapa.");
        return;
    }

    const latitude = parseFloat(dadosGeo[0].lat); //recebe e transforma os dados da latitude de string para numero
    const longitude = parseFloat(dadosGeo[0].lon);

    // Zoom menor quando for só a cidade, mais perto quando tiver rua
    const zoom = dados.street ? 15 : 12;

    document.getElementById("mapa").innerHTML = ""; //zera o mapa

    // Exibe o wrapper do mapa
    document.getElementById("mapa-wrapper").classList.add("visivel");

    const mapa = L.map('mapa').setView([latitude, longitude], zoom); //cria o mapa e define as posições e zoom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapa); //carrega as imagens do mapa

    L.marker([latitude, longitude]) //localizador/marcador do mapa
        .addTo(mapa)
        .bindPopup(`${dados.city}, ${dados.state}`)
        .openPopup();
}

// Permite buscar teclando Enter
document.getElementById("cepID").addEventListener("keydown", function(e) {
    if (e.key === "Enter") buscarCEP();
});

//.catch(erro => {
//    document.getElementById("resultado").innerHTML = `
//        <p>Erro ao procurar o CEP</p>
//    `;
//    console.error(erro);
//});