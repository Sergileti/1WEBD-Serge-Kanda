const TOKEN = TMDB_API_TOKEN;

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

async function findMovies(searchText, page = 1) {
    if (!searchText) return [];
    
    const cacheKey = `search_${searchText}_${page}`;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;
    
    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchText)}&language=fr-FR&page=${page}`;
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
        const data = await response.json();
        const movies = data.results || [];
        
        Cache.set(cacheKey, movies);
        totalMovies = data.total_results || 0;
        return movies;
    } catch {
        return [];
    }
}

function makeMovieElement(movie) {
    const img = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/150x200/333/fff?text=Poster';
    const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
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
                    <a href="movie.html?id=${movie.id}" class="film-link">Voir détails</a>
                </div>
            </div>
        </div>
    `;
}

function showStart() {
    resultsDiv.innerHTML = '<div class="no-results">Commencez votre recherche</div>';
    titleElement.textContent = 'Recherche';
    countElement.textContent = '';
    loadMoreContainer.style.display = 'none';
}

async function doSearch(isNewSearch = true) {
    if (!currentSearch.trim()) {
        showStart();
        return;
    }
    
    if (isNewSearch) {
        pageNumber = 1;
        resultsDiv.innerHTML = '<div class="loading-results">Recherche...</div>';
    }
    
    const movies = await findMovies(currentSearch, pageNumber);
    
    if (isNewSearch) resultsDiv.innerHTML = '';
    if (movies.length === 0 && isNewSearch) {
        resultsDiv.innerHTML = '<div class="no-results">Aucun résultat</div>';
        return;
    }
    
    movies.forEach(movie => resultsDiv.insertAdjacentHTML('beforeend', makeMovieElement(movie)));
    
    titleElement.textContent = `"${currentSearch}"`;
    countElement.textContent = totalMovies ? `${totalMovies} films` : '';
    loadMoreContainer.style.display = movies.length >= 20 ? 'block' : 'none';
}

searchInput.addEventListener('input', function() {
    currentSearch = this.value.trim();
    clearBtn.style.display = currentSearch ? 'block' : 'none';
    
    clearTimeout(this.timer);
    this.timer = setTimeout(() => doSearch(true), 500);
});

clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    currentSearch = '';
    clearBtn.style.display = 'none';
    showStart();
});

loadMoreBtn.addEventListener('click', async function() {
    pageNumber++;
    await doSearch(false);
});

window.onload = showStart;