const tmdbConfig = {
    apiKey: window.TMDB_API_KEY,
    accessToken: window.TMDB_TOKEN,
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    language: 'fr-FR'
};

const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-search');
const searchResults = document.getElementById('search-results');
const resultsTitle = document.getElementById('results-title');
const resultsCount = document.getElementById('results-count');
const btnLoadMore = document.getElementById('btn-load-more');
const loadMoreContainer = document.getElementById('load-more-container');

let currentSearchTerm = '';
let currentPage = 1;
let totalPages = 1;
let totalResults = 0;
let isLoading = false;
let searchTimeout = null;

const fetchOptions = {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${tmdbConfig.accessToken}`,
        'Content-Type': 'application/json'
    }
};

async function searchMovies(query, page = 1) {
    if (!query.trim()) {
        showInitialState();
        return { results: [], total_pages: 1, total_results: 0 };
    }
    
    try {
        const url = `${tmdbConfig.baseUrl}/search/movie?query=${encodeURIComponent(query)}&language=${tmdbConfig.language}&page=${page}`;
        
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            throw new Error(`Erreur: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error("Erreur recherche:", error);
        showError("Erreur de recherche");
        return { results: [], total_pages: 1, total_results: 0 };
    }
}

function showInitialState() {
    searchResults.innerHTML = `
        <div class="no-results">
            <i class="fas fa-film"></i>
            <h4>Commencez votre recherche</h4>
            <p>Utilisez la barre de recherche ci-dessus pour trouver des films</p>
        </div>
    `;
    resultsTitle.textContent = 'Recherche récente';
    resultsCount.textContent = '';
    loadMoreContainer.style.display = 'none';
}

function displayResults(movies, isNewSearch = true) {
    if (isNewSearch) {
        searchResults.innerHTML = '';
    }
    
    if (movies.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h4>Aucun résultat trouvé</h4>
                <p>Essayez avec d'autres mots-clés</p>
            </div>
        `;
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    movies.forEach((movie, index) => {
        const filmCard = createFilmCard(movie);
        searchResults.appendChild(filmCard);
        
        setTimeout(() => {
            filmCard.style.opacity = '1';
            filmCard.style.transform = 'translateY(0)';
        }, index * 50);
    });
    
    resultsTitle.textContent = `Résultats pour "${currentSearchTerm}"`;
    resultsCount.textContent = `${totalResults} films trouvés`;
    
    if (currentPage < totalPages) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

function createFilmCard(movie) {
    const card = document.createElement('div');
    card.className = 'film-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    
    const posterUrl = movie.poster_path 
        ? `${tmdbConfig.imageBaseUrl}${movie.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop&auto=format';
    
    const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" class="film-poster" loading="lazy">
        <div class="film-overlay">
            <div class="film-info">
                <h3 class="film-title">${movie.title}</h3>
                <div class="film-meta">
                    <span>${year}</span>
                    <span>⭐ ${rating}/10</span>
                </div>
                <a href="movie.html?id=${movie.id}" class="film-link">
                    <i class="fas fa-play"></i> Voir détails
                </a>
            </div>
        </div>
    `;
    
    return card;
}

function showLoading() {
    searchResults.innerHTML = `
        <div class="loading-results">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p class="loading-text">Recherche en cours...</p>
        </div>
    `;
}

function showError(message) {
    searchResults.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    loadMoreContainer.style.display = 'none';
}

async function performSearch(isNewSearch = true) {
    if (!currentSearchTerm.trim()) {
        showInitialState();
        return;
    }
    
    if (isNewSearch) {
        currentPage = 1;
        showLoading();
    }
    
    isLoading = true;
    
    try {
        const data = await searchMovies(currentSearchTerm, currentPage);
        
        if (isNewSearch) {
            totalResults = data.total_results || 0;
            totalPages = data.total_pages || 1;
        }
        
        displayResults(data.results || [], isNewSearch);
        
    } catch (error) {
        showError("Erreur lors de la recherche");
    }
    
    isLoading = false;
}

searchInput.addEventListener('input', function() {
    currentSearchTerm = this.value.trim();
    
    if (currentSearchTerm.length > 0) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
        showInitialState();
        return;
    }
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        performSearch(true);
    }, 500);
});

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        performSearch(true);
    }
});

clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    currentSearchTerm = '';
    clearBtn.style.display = 'none';
    showInitialState();
});

btnLoadMore.addEventListener('click', async function() {
    if (isLoading || currentPage >= totalPages) return;
    
    btnLoadMore.disabled = true;
    btnLoadMore.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    
    currentPage++;
    await performSearch(false);
    
    btnLoadMore.disabled = false;
    btnLoadMore.innerHTML = '<i class="fas fa-plus"></i> Charger plus de résultats';
});

window.onload = function() {
    console.log("🔍 Page de recherche CinemaTor");
    showInitialState();
    
    searchInput.focus();
};