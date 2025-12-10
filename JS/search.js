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
let timer = null;

async function findMovies(searchText, page = 1) {
    if (!searchText) return [];
    
    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchText)}&language=fr-FR&page=${page}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (page === 1) {
            totalMovies = data.total_results || 0;
        }
        
        return data.results || [];
        
    } catch (error) {
        console.log('Erreur:', error);
        return [];
    }
}

function makeMovieElement(movie) {
    const movieDiv = document.createElement('div');
    movieDiv.className = 'film-card';
    
    const img = document.createElement('img');
    img.className = 'film-poster';
    img.alt = movie.title;
    
    if (movie.poster_path) {
        img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    } else {
        img.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop';
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'film-overlay';
    
    const info = document.createElement('div');
    info.className = 'film-info';
    
    const title = document.createElement('h3');
    title.className = 'film-title';
    title.textContent = movie.title;
    
    const meta = document.createElement('div');
    meta.className = 'film-meta';
    
    const year = document.createElement('span');
    year.textContent = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    
    const rating = document.createElement('span');
    rating.textContent = `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10`;
    
    meta.appendChild(year);
    meta.appendChild(rating);
    
    const plot = document.createElement('p');
    plot.className = 'film-plot';
    
    let description = movie.overview || 'Pas de description disponible';
    if (description.length > 100) {
        description = description.substring(0, 100) + '...';
    }
    plot.textContent = description;
    
    const link = document.createElement('a');
    link.className = 'film-link';
    link.href = `movie.html?id=${movie.id}`;
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-play';
    
    link.appendChild(icon);
    link.appendChild(document.createTextNode(' Voir détails'));
    
    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(plot);
    info.appendChild(link);
    
    overlay.appendChild(info);
    
    movieDiv.appendChild(img);
    movieDiv.appendChild(overlay);
    
    return movieDiv;
}

function showStart() {
    resultsDiv.innerHTML = '';
    titleElement.textContent = 'Recherche récente';
    countElement.textContent = '';
    loadMoreContainer.style.display = 'none';
    
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-film';
    
    const title = document.createElement('h4');
    title.textContent = 'Commencez votre recherche';
    
    const text = document.createElement('p');
    text.textContent = 'Utilisez la barre de recherche ci-dessus pour trouver des films';
    
    noResults.appendChild(icon);
    noResults.appendChild(title);
    noResults.appendChild(text);
    
    resultsDiv.appendChild(noResults);
}

function showLoading() {
    resultsDiv.innerHTML = '';
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-results';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    const spinnerIcon = document.createElement('i');
    spinnerIcon.className = 'fas fa-spinner fa-spin';
    
    const text = document.createElement('p');
    text.className = 'loading-text';
    text.textContent = 'Recherche en cours...';
    
    spinner.appendChild(spinnerIcon);
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);
    
    resultsDiv.appendChild(loadingDiv);
}

function showEmpty() {
    resultsDiv.innerHTML = '';
    
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'no-results';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-search';
    
    const title = document.createElement('h4');
    title.textContent = 'Aucun résultat trouvé';
    
    const text = document.createElement('p');
    text.textContent = 'Essayez avec d\'autres mots-clés';
    
    emptyDiv.appendChild(icon);
    emptyDiv.appendChild(title);
    emptyDiv.appendChild(text);
    
    resultsDiv.appendChild(emptyDiv);
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
        const movieElement = makeMovieElement(movie);
        resultsDiv.appendChild(movieElement);
    });
    
    titleElement.textContent = `Résultats pour "${currentSearch}"`;
    countElement.textContent = `${totalMovies} films trouvés`;
    
    if (movies.length >= 20) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

async function doSearch(isNewSearch = true) {
    if (!currentSearch) {
        showStart();
        return;
    }
    
    if (isNewSearch) {
        pageNumber = 1;
        showLoading();
    }
    
    searching = true;
    
    const movies = await findMovies(currentSearch, pageNumber);
    
    showResults(movies, isNewSearch);
    
    searching = false;
}

searchInput.addEventListener('input', function() {
    currentSearch = this.value.trim();
    
    clearBtn.style.display = currentSearch ? 'block' : 'none';
    
    if (!currentSearch) {
        showStart();
        return;
    }
    
    if (timer) {
        clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
        doSearch(true);
    }, 500);
});

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (timer) {
            clearTimeout(timer);
        }
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
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    
    pageNumber++;
    await doSearch(false);
    
    loadMoreBtn.disabled = false;
    loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Charger plus de résultats';
});

window.onload = function() {
    showStart();
    searchInput.focus();
};