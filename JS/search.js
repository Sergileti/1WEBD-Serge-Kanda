const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI';

const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-search');
const resultsDiv = document.getElementById('search-results');
const titleElement = document.getElementById('results-title');
const countElement = document.getElementById('results-count');
const loadMoreBtn = document.getElementById('btn-load-more');
const loadMoreContainer = document.getElementById('load-more-container');

let currentSearch = '';
let pageNumber = 1;
let totalMovies = 0;
let searching = false;

async function findMovies(searchText, page = 1) {
    if (!searchText) return [];
    
    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchText)}&language=fr-FR&page=${page}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        if (!response.ok) throw new Error('Erreur API');
        const data = await response.json();
        
        totalMovies = data.total_results || 0;
        return data.results || [];
        
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

function makeMovieElement(movie) {
    const img = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/150x200/333/fff?text=Poster';
    
    const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const description = movie.overview ? movie.overview.substring(0, 80) + '...' : 'Pas de description';
    
    return `
        <div class="film-card">
            <img src="${img}" alt="${movie.title}" class="film-poster">
            <div class="film-overlay">
                <div class="film-info">
                    <h3 class="film-title">${movie.title}</h3>
                    <div class="film-meta">
                        <span>${year}</span>
                        <span>⭐ ${rating}/10</span>
                    </div>
                    <p class="film-plot">${description}</p>
                    <a href="movie.html?id=${movie.id}" class="film-link">Voir détails</a>
                </div>
            </div>
        </div>
    `;
}

function showStart() {
    resultsDiv.innerHTML = `
        <div class="no-results">
            <h4>Commencez votre recherche</h4>
            <p>Utilisez la barre de recherche ci-dessus</p>
        </div>
    `;
    titleElement.textContent = 'Recherche récente';
    countElement.textContent = '';
    loadMoreContainer.style.display = 'none';
}

function showLoading() {
    resultsDiv.innerHTML = '<div class="loading-results">Recherche en cours...</div>';
}

function showEmpty() {
    resultsDiv.innerHTML = `
        <div class="no-results">
            <h4>Aucun résultat trouvé</h4>
            <p>Essayez avec d'autres mots-clés</p>
        </div>
    `;
    loadMoreContainer.style.display = 'none';
}

function showResults(movies, isNewSearch = true) {
    if (isNewSearch) {
        resultsDiv.innerHTML = '';
    }
    
    if (movies.length === 0) {
        showEmpty();
        return;
    }
    
    movies.forEach(movie => {
        resultsDiv.insertAdjacentHTML('beforeend', makeMovieElement(movie));
    });
    
    titleElement.textContent = `Résultats pour "${currentSearch}"`;
    countElement.textContent = `${totalMovies} films`;
    loadMoreContainer.style.display = movies.length >= 20 ? 'block' : 'none';
}

async function doSearch(isNewSearch = true) {
    if (!currentSearch.trim()) {
        showStart();
        return;
    }
    
    if (isNewSearch) {
        pageNumber = 1;
        showLoading();
    }
    
    searching = true;
    
    try {
        const movies = await findMovies(currentSearch, pageNumber);
        showResults(movies, isNewSearch);
    } catch (error) {
        showEmpty();
    } finally {
        searching = false;
    }
}

// Événements
searchInput.addEventListener('input', function() {
    currentSearch = this.value.trim();
    clearBtn.style.display = currentSearch ? 'block' : 'none';
    
    clearTimeout(this.timer);
    this.timer = setTimeout(() => doSearch(true), 500);
});

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        clearTimeout(this.timer);
        doSearch(true);
    }
});

clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    currentSearch = '';
    clearBtn.style.display = 'none';
    showStart();
});

loadMoreBtn.addEventListener('click', async function() {
    if (searching) return;
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Chargement...';
    
    pageNumber++;
    await doSearch(false);
    
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Charger plus';
});

// Initialisation
window.onload = showStart;