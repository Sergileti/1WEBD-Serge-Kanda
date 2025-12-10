const tmdbConfig = {
    apiKey: '90b0196ccc5268645d270095b394a5b6',
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    language: 'fr-FR'
};

const filmsContainer = document.getElementById('movies-2024');
const btnCharger = document.getElementById('btn-charger-plus');

let pageActuelle = 1;
let enCoursDeChargement = false;
let totalPages = 1;
let typeActuel = 'tendance';

const fetchOptions = {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${tmdbConfig.accessToken}`,
        'Content-Type': 'application/json'
    }
};

async function chercherFilmsTendance(page = 1) {
    try {
        const url = `${tmdbConfig.baseUrl}/movie/popular?language=${tmdbConfig.language}&page=${page}`;
        const reponse = await fetch(url, fetchOptions);
        
        if (!reponse.ok) throw new Error(`Erreur: ${reponse.status}`);
        
        const data = await reponse.json();
        return {
            films: data.results || [],
            totalPages: data.total_pages || 1
        };
        
    } catch (error) {
        console.error("Erreur TMDB:", error);
        return { films: [], totalPages: 1 };
    }
}

async function chercherFilms2024(page = 1) {
    try {
        const url = `${tmdbConfig.baseUrl}/discover/movie?language=${tmdbConfig.language}&page=${page}&primary_release_year=2024&sort_by=popularity.desc`;
        const reponse = await fetch(url, fetchOptions);
        
        if (!reponse.ok) throw new Error(`Erreur: ${reponse.status}`);
        
        const data = await reponse.json();
        return {
            films: data.results || [],
            totalPages: data.total_pages || 1
        };
        
    } catch (error) {
        console.error("Erreur TMDB 2024:", error);
        return { films: [], totalPages: 1 };
    }
}

function creerCarteFilm(film) {
    const carte = document.createElement('div');
    carte.className = 'film';
    
    const note = film.vote_average ? film.vote_average.toFixed(1) : "N/A";
    
    const image = film.poster_path 
        ? `${tmdbConfig.imageBaseUrl}${film.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop&auto=format';
    
    let description = film.overview || "Pas de description disponible.";
    if (description.length > 120) {
        description = description.substring(0, 120) + '...';
    }
    
    const annee = film.release_date ? film.release_date.substring(0, 4) : "N/A";
    
    carte.innerHTML = `
        <img src="${image}" alt="${film.title}" class="film-img" loading="lazy">
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

function afficherChargement() {
    filmsContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p class="loading-text">Chargement des films...</p>
        </div>
    `;
}

function afficherFin() {
    const finDiv = document.createElement('div');
    finDiv.className = 'end-message';
    finDiv.innerHTML = `
        <p><i class="fas fa-check-circle"></i> Tous les films ont été chargés !</p>
    `;
    filmsContainer.appendChild(finDiv);
    btnCharger.style.display = 'none';
}

function afficherErreur(message) {
    filmsContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <p>Veuillez réessayer plus tard</p>
        </div>
    `;
}

async function chargerFilms(type = typeActuel) {
    if (enCoursDeChargement) return;
    
    enCoursDeChargement = true;
    typeActuel = type;
    
    btnCharger.disabled = true;
    btnCharger.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    
    try {
        if (pageActuelle === 1) {
            afficherChargement();
        }
        
        let resultats;
        
        if (type === '2024') {
            resultats = await chercherFilms2024(pageActuelle);
        } else {
            resultats = await chercherFilmsTendance(pageActuelle);
        }
        
        const { films, totalPages: total } = resultats;
        
        if (films.length === 0 && pageActuelle === 1) {
            afficherErreur("Aucun film trouvé");
            return;
        }
        
        totalPages = total;
        
        if (pageActuelle === 1) {
            filmsContainer.innerHTML = '';
        }
        
        for (let i = 0; i < films.length; i++) {
            const film = films[i];
            const carte = creerCarteFilm(film);
            
            setTimeout(() => {
                filmsContainer.appendChild(carte);
            }, i * 50);
        }
        
        pageActuelle++;
        
        if (pageActuelle > totalPages) {
            setTimeout(() => afficherFin(), films.length * 50);
        } else {
            btnCharger.disabled = false;
            btnCharger.innerHTML = '<i class="fas fa-plus"></i> Charger plus de films';
        }
        
    } catch (error) {
        console.error("Erreur:", error);
        afficherErreur("Erreur de connexion");
        btnCharger.disabled = false;
        btnCharger.innerHTML = '<i class="fas fa-redo"></i> Réessayer';
    }
    
    setTimeout(() => {
        enCoursDeChargement = false;
    }, 500);
}

function creerBoutonsFiltre() {
    const texteChoix = document.querySelector('p[style*="text-align: center"]');
    
    const filtreContainer = document.createElement('div');
    filtreContainer.className = 'filtre-container';
    
    const btnTendance = document.createElement('button');
    btnTendance.className = 'btn-filtre btn-filtre-tendance btn-active';
    btnTendance.innerHTML = '<i class="fas fa-fire"></i> Films Tendance';
    btnTendance.id = 'btn-tendance';
    
    const btn2024 = document.createElement('button');
    btn2024.className = 'btn-filtre btn-filtre-2024 btn-inactive';
    btn2024.innerHTML = '<i class="fas fa-calendar-star"></i> Films 2024';
    btn2024.id = 'btn-2024';
    
    filtreContainer.appendChild(btnTendance);
    filtreContainer.appendChild(btn2024);
    
    texteChoix.parentNode.insertBefore(filtreContainer, texteChoix.nextSibling);
    
    function mettreAJourBoutons(typeActif) {
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
    
    btnTendance.addEventListener('click', function() {
        if (typeActuel === 'tendance') return;
        pageActuelle = 1;
        mettreAJourBoutons('tendance');
        chargerFilms('tendance');
    });
    
    btn2024.addEventListener('click', function() {
        if (typeActuel === '2024') return;
        pageActuelle = 1;
        mettreAJourBoutons('2024');
        chargerFilms('2024');
    });
}

btnCharger.addEventListener('click', function() {
    chargerFilms(typeActuel);
});

window.onload = function() {
    console.log("🎬 CinemaTor - TMDB API");
    
    creerBoutonsFiltre();
    
    chargerFilms('tendance');
};