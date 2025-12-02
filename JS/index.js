// Ta clé API
const cleAPI = '327d1fbe';

// Films à chercher (titres en anglais pour l'API)
const filmsPopulaires = ["Inception", "The Dark Knight", "Interstellar"];
const films2024 = ["Dune", "Godzilla x Kong", "Kung Fu Panda 4"];

// Éléments de la page
const divTendance = document.getElementById('films-tendance');
const div2024 = document.getElementById('films-2024');
const btnPlus = document.getElementById('btn-plus');

// Charger les films tendance
async function chargerFilmsTendance() {
    divTendance.innerHTML = "<p>Chargement des films...</p>";
    
    for (let film of filmsPopulaires) {
        await ajouterFilm(film, divTendance);
    }
}

// Charger les films 2024
async function chargerFilms2024() {
    div2024.innerHTML = "<p>Chargement des films 2024...</p>";
    
    // Afficher seulement 2 films au début
    for (let i = 0; i < 2; i++) {
        if (films2024[i]) {
            await ajouterFilm(films2024[i], div2024);
        }
    }
}

// Ajouter un film à la page
async function ajouterFilm(titreFilm, divParent) {
    try {
        // Chercher le film sur OMDb
        const reponse = await fetch(
            `http://www.omdbapi.com/?apikey=${cleAPI}&t=${titreFilm}`
        );
        
        const film = await reponse.json();
        
        if (film.Response === "True") {
            // Créer la carte du film
            const carte = document.createElement('div');
            carte.className = 'film';
            
            // Image du film ou image par défaut
            const image = film.Poster !== "N/A" 
                ? film.Poster 
                : 'https://via.placeholder.com/300x400/333/fff?text=Poster';
            
            // Résumé court
            const resume = film.Plot && film.Plot.length > 100 
                ? film.Plot.substring(0, 100) + '...' 
                : film.Plot || 'Pas de résumé disponible';
            
            carte.innerHTML = `
                <img src="${image}" alt="${film.Title}">
                <div class="film-info">
                    <h3 class="film-titre">${film.Title}</h3>
                    <p class="film-annee">${film.Year}</p>
                    <p class="film-resume">${resume}</p>
                    <a href="movie.html?id=${film.imdbID}" class="film-lien">
                        Voir plus
                    </a>
                </div>
            `;
            
            divParent.appendChild(carte);
        }
        
    } catch (erreur) {
        console.log("Erreur pour " + titreFilm + ":", erreur);
    }
}

// Ajouter plus de films 2024 quand on clique
let filmsAffiches = 2;
btnPlus.addEventListener('click', async function() {
    if (filmsAffiches < films2024.length) {
        await ajouterFilm(films2024[filmsAffiches], div2024);
        filmsAffiches++;
        
        // Cacher le bouton si on a tout affiché
        if (filmsAffiches >= films2024.length) {
            btnPlus.style.display = 'none';
        }
    }
});

// Démarrer quand la page charge
window.onload = function() {
    chargerFilmsTendance();
    chargerFilms2024();
};