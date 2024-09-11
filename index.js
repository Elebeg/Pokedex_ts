"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "/pages"));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Rota principal que lista os Pokémons
app.get("/", function (request, response) {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=40")
        .then((res) => res.json())
        .then((data) => {
        // Adiciona o ID ao resultado (extrai o ID da URL)
        const results = data.results.map((pokemon) => {
            const id = pokemon.url.split("/").filter(Boolean).pop(); // Extrai o ID da URL
            return { ...pokemon, id }; // Adiciona o ID ao objeto Pokémon
        });
        response.render("index", { results });
    });
});
// Nova rota para exibir detalhes de um Pokémon --JÁ PREDEFINIDO--
app.get("/pokemon/:id", function (request, response) {
    const { id } = request.params;
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then((res) => res.json())
        .then((pokemon) => {
        response.render("pokemon", { pokemon });
    })
        .catch((error) => {
        console.error("Erro ao buscar Pokémon:", error);
        response.status(500).send("Erro ao buscar Pokémon");
    });
});
// Nova rota para exibir um Pokémon --USUÁRIO SELECIONOU--
app.get("/pokemon", (request, response) => {
    const { id } = request.query;
    if (!id) {
        return response.status(400).send("ID do Pokémon é necessário.");
    }
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then((res) => res.json())
        .then((pokemon) => {
        response.render("pokemon", { pokemon });
    })
        .catch((error) => {
        console.error("Erro ao buscar Pokémon:", error);
        response.status(500).send("Erro ao buscar Pokémon");
    });
});
// Rota para comparar Pokemons selecionados
app.get("/compare", async (request, response) => {
    const { pokemon1, pokemon2 } = request.query;
    if (!pokemon1 || !pokemon2) {
        return response.status(400).send("Parâmetros de comparação ausentes.");
    }
    try {
        // Faz requisições paralelas para obter os dados dos dois Pokémons
        const [res1, res2] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon1}`),
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon2}`)
        ]);
        // Verifica se ambos os Pokémons foram encontrados
        if (!res1.ok || !res2.ok) {
            return response.status(404).send("Pokémon não encontrado.");
        }
        const [pokemonData1, pokemonData2] = await Promise.all([
            res1.json(),
            res2.json()
        ]);
        response.render("compare", { pokemon1: pokemonData1, pokemon2: pokemonData2 });
    }
    catch (error) {
        console.error("Erro ao buscar Pokémon para comparação:", error);
        response.status(500).send("Erro ao buscar Pokémon para comparação");
    }
});
app.listen(4001, function () {
    console.log("Server is running");
});
