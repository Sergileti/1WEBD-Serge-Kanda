const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI';

const movieId = new URLSearchParams(window.location.search).get('id');

async function getMovie() {
    if (!movieId) {
        showError('Aucun film sélectionné.');
        return;
    }
    
    const cacheKey = `movie_${movieId}`;
    const cached = Cache.get(cacheKey); 
    
    if (cached) {
        
        showMovie(cached.movie, cached.credits);
        return;
    }
    
    try {
        const [movieRes, creditsRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=fr-FR`, { headers: { 'Authorization': `Bearer ${TOKEN}` } }),
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=fr-FR`, { headers: { 'Authorization': `Bearer ${TOKEN}` } })
        ]);
        
        const movie = await movieRes.json();
        const credits = await creditsRes.json();
        
        
        Cache.set(cacheKey, { movie, credits });
        showMovie(movie, credits);
        
    } catch {
        showError('Erreur de chargement');
    }
}

function showMovie(movie, credits) {
    document.getElementById('movie-title').textContent = movie.title || 'Titre inconnu';
    document.title = (movie.title || 'Film') + ' - CinemaTor';
    
    const poster = document.getElementById('movie-poster');
    poster.src = movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'https://via.placeholder.com/500x750/333/fff?text=Poster';
    
    document.getElementById('movie-overview').textContent = movie.overview || 'Pas de synopsis disponible.';
    
    const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    document.getElementById('movie-year').textContent = year;
    
    if (movie.runtime) {
        const hours = Math.floor(movie.runtime / 60);
        const minutes = movie.runtime % 60;
        const time = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
        document.getElementById('movie-runtime').textContent = time;
        document.getElementById('movie-duration').textContent = time;
    }
    
    if (movie.vote_average) {
        document.getElementById('movie-rating').textContent = movie.vote_average.toFixed(1) + '/10';
        document.getElementById('movie-vote-average').textContent = movie.vote_average.toFixed(1) + '/10';
        document.getElementById('movie-vote-count').textContent = (movie.vote_count || 0) + ' votes';
    }
    
    if (movie.release_date) {
        const date = new Date(movie.release_date);
        document.getElementById('movie-release-date').textContent = date.toLocaleDateString('fr-FR');
    }
    
    document.getElementById('movie-status').textContent = movie.status || 'Inconnu';
    document.getElementById('movie-language').textContent = movie.original_language || 'N/A';
    
    const genresDiv = document.getElementById('movie-genres');
    genresDiv.innerHTML = '';
    if (movie.genres?.length) {
        movie.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre.name;
            genresDiv.appendChild(tag);
        });
    } else {
        genresDiv.innerHTML = '<span class="genre-tag">Non spécifié</span>';
    }
    
    const dvdSection = document.getElementById('dvd-section');
    if (movie.release_dates?.results) {
        const frRelease = movie.release_dates.results.find(r => r.iso_3166_1 === 'FR');
        if (frRelease?.release_dates) {
            const dvdRelease = frRelease.release_dates.find(rd => rd.type === 5 || rd.type === 6);
            if (dvdRelease?.release_date) {
                const dvdDate = new Date(dvdRelease.release_date);
                document.getElementById('movie-dvd-date').textContent = dvdDate.toLocaleDateString('fr-FR');
                dvdSection.style.display = 'block';
                return;
            }
        }
    }
    dvdSection.style.display = 'none';
    
    const castDiv = document.getElementById('movie-cast');
    castDiv.innerHTML = '';
    if (credits.cast?.length) {
        credits.cast.slice(0, 8).forEach(actor => {
            castDiv.innerHTML += `
                <div class="cast-item">
                    <img class="cast-photo" alt="${actor.name}" 
                         src="${actor.profile_path ? 'https://image.tmdb.org/t/p/w200' + actor.profile_path : 'https://via.placeholder.com/150x200/333/fff?text=Photo'}">
                    <div class="cast-info">
                        <div class="cast-name">${actor.name}</div>
                        <div class="cast-role">${actor.character || 'Rôle inconnu'}</div>
                    </div>
                </div>
            `;
        });
    } else {
        castDiv.innerHTML = '<div style="text-align:center; padding:30px; color:#aaa;">Casting non disponible</div>';
    }
}

function showError(message) {
    document.querySelector('main').innerHTML = `
        <div style="text-align:center; padding:50px;">
            <h2 style="color:#e50914;">Erreur</h2>
            <p>${message}</p>
            <a href="index.html" class="back-btn">Accueil</a>
        </div>
    `;
}

window.onload = getMovie;