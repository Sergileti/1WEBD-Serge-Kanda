const API_KEY = '90b0196ccc5268645d270095b394a5b6';
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI';

const filmsContainer = document.getElementById('movies-2024');
const btnCharger = document.getElementById('btn-charger-plus');

let page = 1;
let type = 'tendance';

function creerBoutons() {
    const texte = document.querySelector('.description-text');
    
    const divBoutons = document.createElement('div');
    divBoutons.className = 'filtre-container';
    
    divBoutons.innerHTML = `
        <button id="btn-tendance" class="btn-filtre btn-filtre-tendance btn-active">
            <i class="fas fa-fire"></i> Films Tendance
        </button>
        <button id="btn-2024" class="btn-filtre btn-filtre-2024 btn-inactive">
            <i class="fas fa-calendar-star"></i> Films 2024
        </button>
    `;
    
    texte.after(divBoutons);
    
    document.getElementById('btn-tendance').onclick = function() {
        if (type === 'tendance') return;
        type = 'tendance';
        page = 1;
        changerBoutons('tendance');
        chargerFilms();
    };
    
    document.getElementById('btn-2024').onclick = function() {
        if (type === '2024') return;
        type = '2024';
        page = 1;
        changerBoutons('2024');
        chargerFilms();
    };
}

function changerBoutons(typeActif) {
    const btnTendance = document.getElementById('btn-tendance');
    const btn2024 = document.getElementById('btn-2024');
    
    if (typeActif === 'tendance') {
        btnTendance.className = 'btn-filtre btn-filtre-tendance btn-active';
        btn2024.className = 'btn-filtre btn-filtre-2024 btn-inactive';
    } else {
        btnTendance.className = 'btn-filtre btn-filtre-tendance btn-inactive';
        btn2024.className = 'btn-filtre btn-filtre-2024 btn-active';
    }
}

async function chercherFilms() {
    let url;
    
    if (type === '2024') {
        url = `https://api.themoviedb.org/3/discover/movie?language=fr-FR&page=${page}&primary_release_year=2024&sort_by=popularity.desc`;
    } else {
        url = `https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=${page}`;
    }
    
    try {
        const reponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await reponse.json();
        return data.results || [];
        
    } catch (erreur) {
        console.log('Erreur:', erreur);
        return [];
    }
}

function creerCarte(film) {
    const carte = document.createElement('div');
    carte.className = 'film';
    
    const image = film.poster_path 
        ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop';
    
    const note = film.vote_average ? film.vote_average.toFixed(1) : 'N/A';
    
    const annee = film.release_date ? film.release_date.substring(0, 4) : 'N/A';
    
    let description = film.overview || 'Pas de description';
    if (description.length > 100) {
        description = description.substring(0, 100) + '...';
    }
    
    carte.innerHTML = `
        <img src="${image}" alt="${film.title}" class="film-img">
        <div class="film-overlay">
            <div class="film-info">
                <h3 class="film-title">${film.title}</h3>
                <div class="film-meta">
                    <span>${annee}</span>
                    <span class="film-rating">⭐ ${note}/10</span>
                </div>
                <p class="film-plot">${description}</p>
                <a href="movie.html?id=${film.id}" class="film-link">
                    <i class="fas fa-play"></i> Voir détails
                </a>
            </div>
        </div>
    `;
    
    return carte;
}

async function chargerFilms() {
    if (page === 1) {
        filmsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p class="loading-text">Chargement des films...</p>
            </div>
        `;
    }
    
    btnCharger.disabled = true;
    btnCharger.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    
    const films = await chercherFilms();
    
    if (page === 1) {
        filmsContainer.innerHTML = '';
    }
    
    films.forEach(film => {
        const carte = creerCarte(film);
        filmsContainer.appendChild(carte);
    });
    
    btnCharger.disabled = false;
    btnCharger.innerHTML = '<i class="fas fa-plus"></i> Charger plus de films';
    
    page++;
}

window.onload = function() {
    console.log('🎬 Page prête');
    
    creerBoutons();
    
    chargerFilms();
    
    btnCharger.onclick = chargerFilms;
};