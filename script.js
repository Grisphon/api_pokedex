async function getPokemonList() {
    const storedData = localStorage.getItem('pokemonListQM');
    return storedData ? JSON.parse(storedData) : await fetchAndStorePokemonList();
}

async function getRandomPokemon() {
    const pokemonList = await getPokemonList();

    if (pokemonList.length === 0) {
        console.error('La liste des Pokémon est vide.');
        return;
    }

    const randomIndex = Math.floor(Math.random() * pokemonList.length);

    const randomPokemonId = pokemonList[randomIndex].pokedex_id;

    window.location.href = `pokemon.html?id=${randomPokemonId}`;
}

async function fetchAndStorePokemonList() {
    try {
        const response = await fetch('https://tyradex.vercel.app/api/v1/pokemon');
        const data = await response.json();
        localStorage.setItem('pokemonListQM', JSON.stringify(data));
        return data;
    } catch (error) {
        throw error;
    }
}

async function getTypes() {
    try {
        const response = await fetch('https://tyradex.vercel.app/api/v1/types');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

function clearLocalStorageData() {
    localStorage.clear();
    alert('Les données locales ont été supprimées.');
}

async function displayPokemonList() {
    const pokemonList = await getPokemonList();
    const listContainer = document.getElementById('pokemonList');

    for (const pokemon of pokemonList.filter(p => p.pokedex_id !== 0)) {
        const listItem = document.createElement('li');
        const spriteUrl = pokemon.sprites?.regular || 'placeholder-image-url';

        const typesHTML = pokemon.types?.map(type => `<img src="${type.image}" alt="${type.name}" class="types" />`).join('');

        listItem.innerHTML = `
            <img src="${spriteUrl}" alt="${pokemon.name}" class="sprite" />
            <div class="pokemon-info">
                ${typesHTML}
                <p class="pokedex-number">N°${pokemon.pokedex_id}</p>
                <a href="pokemon.html?id=${pokemon.pokedex_id}" class="pokemon-name">${pokemon.name.fr}</a>
            </div>
        `;

        const typeElements = listItem.querySelectorAll('.types');
        typeElements.forEach((typeElement, index) => typeElement.classList.add(`type-${pokemon.types[index].name.toLowerCase()}`));

        listItem.addEventListener('click', () => window.location.href = `pokemon.html?id=${pokemon.pokedex_id}`);
        listContainer.appendChild(listItem);
    }
}

let isTableCreated = false;

async function createTypeTable(pokemon) {
    try {
        const types = await getTypes();
        const typeTableContainer = document.getElementById('typeTable');

        if (typeTableContainer && !isTableCreated) {
            const table = document.createElement('table');

            const imageRow = document.createElement('tr');
            types.forEach(type => {
                const typeImage = document.createElement('td');
                typeImage.innerHTML = `<img src="${type.sprites}" alt="${type.name}" class="types-display" />`;
                imageRow.appendChild(typeImage);
            });
            table.appendChild(imageRow);

            const multipliersRow = document.createElement('tr');
            types.forEach(type => {
                const multiplierCell = document.createElement('td');
                const resistance = pokemon.resistances.find(resistance => resistance.name === type.name.fr);

                if (resistance) {
                    const cssClass = getCssClassForMultiplier(resistance.multiplier);
                    multiplierCell.classList.add(cssClass);
                    multiplierCell.textContent = 'x ' + resistance.multiplier;
                } else {
                    multiplierCell.textContent = '-';
                }

                multipliersRow.appendChild(multiplierCell);
            });
            table.appendChild(multipliersRow);

            typeTableContainer.appendChild(table);
            isTableCreated = true;
        } else {
            console.log('Table already created or element not found.');
        }
    } catch (error) {
        console.error('Error fetching types:', error);
    }
}

function getCssClassForMultiplier(multiplier) {
    switch (multiplier) {
        case 0:
            return 'black';
        case 0.25:
            return 'green-apple';
        case 0.5:
            return 'green';
        case 1:
            return 'gray';
        case 2:
            return 'light-red';
        case 4:
            return 'dark-red';
        default:
            return '';
    }
}

async function displayPokemonDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = urlParams.get('id');

    if (pokemonId) {
        const storedData = localStorage.getItem(`pokemonDetails-${pokemonId}`);

        if (storedData) {
            const pokemon = JSON.parse(storedData);
            updateDetailsView(pokemon);
            createTypeTable(pokemon);
        } else {
            try {
                const response = await fetch(`https://tyradex.vercel.app/api/v1/pokemon/${pokemonId}`);
                const pokemon = await response.json();
                localStorage.setItem(`pokemonDetails-${pokemonId}`, JSON.stringify(pokemon));
                updateDetailsView(pokemon);
                createTypeTable(pokemon);
            } catch (error) {
                console.error('Error fetching Pokemon details:', error);
            }
        }
    }
}

function updateDetailsView(pokemon) {
    const spriteUrl = pokemon.sprites?.regular || 'placeholder-image-url';
    const detailsContainer = document.getElementById('pokemonDetails');

    detailsContainer.innerHTML = `
        <h1>N° ${pokemon.pokedex_id} ${pokemon.name.fr}</h1>
        <img src="${spriteUrl}" alt="${pokemon.name.fr}" class="sprite" />
        <p>${pokemon.category}</p>
        <table>
            <tr>
                <th>Type</th>
                <td>${pokemon.types?.map(type => `<img src="${type.image}" alt="${type.name.fr}" class="types-display" />`).join('')}</td>
            </tr>
            <tr>
                <th>PV</th>
                <td>${pokemon.stats.hp}</td>
            </tr>
            <tr>
                <th>Attaque</th>
                <td>${pokemon.stats.atk}</td>
            </tr>
            <tr>
                <th>Défense</th>
                <td>${pokemon.stats.def}</td>
            </tr>
            <tr>
                <th>Attaque Spéciale</th>
                <td>${pokemon.stats.spe_atk}</td>
            </tr>
            <tr>
                <th>Defense Spéciale</th>
                <td>${pokemon.stats.spe_def}</td>
            </tr>
            <tr>
                <th>Vitesse</th>
                <td>${pokemon.stats.vit}</td>
            </tr>
        </table>
    `;
    createTypeTable(pokemon);
}

function searchPokemon() {
    const searchInput = document.getElementById('pokemonSearch');
    const searchTerm = searchInput.value.trim().toLowerCase();

    const listContainer = document.getElementById('pokemonList');
    const pokemonItems = listContainer.getElementsByTagName('li');

    for (const pokemonItem of pokemonItems) {
        const pokemonName = pokemonItem.querySelector('.pokemon-name').textContent.toLowerCase();

        if (pokemonName.includes(searchTerm)) {
            pokemonItem.style.display = '';
        } else {
            pokemonItem.style.display = 'none';
        }
    }
}

function filterByType() {
    const typeFilterSelect = document.getElementById('typeFilter');
    const selectedTypes = Array.from(typeFilterSelect.selectedOptions).map(option => option.value);

    if (selectedTypes.length === 0) {
        resetTypeFilter();
        return;
    }

    const listContainer = document.getElementById('pokemonList');
    const pokemonItems = listContainer.getElementsByTagName('li');

    for (const pokemonItem of pokemonItems) {
        const pokemonTypes = Array.from(pokemonItem.querySelectorAll('.types')).map(typeElement => typeElement.alt.toLowerCase());

        if (selectedTypes.some(type => pokemonTypes.includes(type.toLowerCase()))) {
            pokemonItem.style.display = '';
        } else {
            pokemonItem.style.display = 'none';
        }
    }
}

function resetTypeFilter() {
    const listContainer = document.getElementById('pokemonList');
    const pokemonItems = listContainer.getElementsByTagName('li');

    for (const pokemonItem of pokemonItems) {
        pokemonItem.style.display = '';
    }
}

if (document.title === 'Liste des Pokémon') {
    displayPokemonList();
    const searchInput = document.getElementById('pokemonSearch');
    searchInput.addEventListener('input', searchPokemon);
    const typeFilterSelect = document.getElementById('typeFilter');
    typeFilterSelect.addEventListener('change', filterByType);
} else if (document.title === 'Détails du Pokémon') {
    displayPokemonDetails();
}

document.addEventListener('DOMContentLoaded', function () {
    const filterWrapper = document.querySelector('.filter-wrapper');

    filterWrapper.addEventListener('mouseenter', function () {
        const typeFilter = document.getElementById('typeFilter');
        typeFilter.style.display = 'block';
    });

    filterWrapper.addEventListener('mouseleave', function () {
        const typeFilter = document.getElementById('typeFilter');
        typeFilter.style.display = 'none';
    });
});

