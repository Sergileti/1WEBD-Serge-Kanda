const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI';

let page = 1;
let type = 'tendance';
const filmsContainer = document.getElementById('movies-2024');
const btnCharger = document.getElementById('btn-charger-plus');

async function chercherFilms() {
    const cacheKey = `films_${type}_${page}`;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;
    
    const url = type === '2024' 
        ? `https://api.themoviedb.org/3/discover/movie?language=fr-FR&page=${page}&primary_release_year=2024&sort_by=popularity.desc`
        : `https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=${page}`;
    
    try {
        const reponse = await fetch(url, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
        const data = await reponse.json();
        const films = data.results || [];
        
        Cache.set(cacheKey, films);
        return films;
    } catch {
        return [];
    }
}

function creerCarte(film) {
    const image = film.poster_path ? `https://image.tmdb.org/t/p/w500${film.poster_path}` : 'https://via.placeholder.com/200x300/333/fff?text=Poster';
    const note = film.vote_average ? film.vote_average.toFixed(1) : 'N/A';
    const annee = film.release_date ? film.release_date.substring(0, 4) : 'N/A';
    
    return `
        <div class="film">
            <img src="${image}" alt="${film.title}" class="film-img">
            <div class="film-overlay">
                <div class="film-info">
                    <h3 class="film-title">${film.title}</h3>
                    <div class="film-meta">
                        <span>${annee}</span>
                        <span class="film-rating">⭐ ${note}/10</span>
                    </div>
                    <a href="movie.html?id=${film.id}" class="film-link">Voir détails</a>
                </div>
            </div>
        </div>
    `;
}

async function chargerFilms() {
    btnCharger.disabled = true;
    btnCharger.textContent = 'Chargement...';
    
    const films = await chercherFilms();
    
    if (films.length === 0 && page === 1) {
        filmsContainer.innerHTML = '<div class="error-message">Aucun film trouvé</div>';
        return;
    }
    
    films.forEach(film => filmsContainer.insertAdjacentHTML('beforeend', creerCarte(film)));
    
    page++;
    btnCharger.disabled = false;
    btnCharger.textContent = 'Charger plus de films';
}

function creerBoutons() {
    const html = `
        <div class="filtre-container">
            <button id="btn-tendance" class="btn-filtre btn-filtre-tendance btn-active">Films Tendance</button>
            <button id="btn-2024" class="btn-filtre btn-filtre-2024 btn-inactive">Films 2024</button>
        </div>
    `;
    document.querySelector('.description-text').insertAdjacentHTML('afterend', html);
    
    document.getElementById('btn-tendance').onclick = () => {
        if (type === 'tendance') return;
        type = 'tendance';
        page = 1;
        filmsContainer.innerHTML = '';
        document.getElementById('btn-tendance').className = 'btn-filtre btn-filtre-tendance btn-active';
        document.getElementById('btn-2024').className = 'btn-filtre btn-filtre-2024 btn-inactive';
        chargerFilms();
    };
    
    document.getElementById('btn-2024').onclick = () => {
        if (type === '2024') return;
        type = '2024';
        page = 1;
        filmsContainer.innerHTML = '';
        document.getElementById('btn-tendance').className = 'btn-filtre btn-filtre-tendance btn-inactive';
        document.getElementById('btn-2024').className = 'btn-filtre btn-filtre-2024 btn-active';
        chargerFilms();
    };
}

window.onload = function() {
    creerBoutons();
    chargerFilms();
    btnCharger.onclick = chargerFilms;
};