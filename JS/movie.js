const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI';

const movieId = new URLSearchParams(window.location.search).get('id');

async function getMovie() {
    if (!movieId) {
        showError('Aucun film sélectionné.');
        return;
    }
    
    try {
       
        const [movieRes, creditsRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=fr-FR`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            }),
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=fr-FR`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            })
        ]);
        
        const movie = await movieRes.json();
        const credits = await creditsRes.json();
        
        showMovie(movie, credits);
        
    } catch (error) {
        showError();
    }
}

function showMovie(movie, credits) {
    
    document.getElementById('movie-title').textContent = movie.title;
    document.title = movie.title + ' - CinemaTor';
    
    
    if (movie.poster_path) {
        document.getElementById('movie-poster').src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    }
    
    
    document.getElementById('movie-overview').textContent = movie.overview || 'Pas de synopsis';
    
    
    if (movie.release_date) {
        const year = movie.release_date.substring(0, 4);
        document.getElementById('movie-year').textContent = year;
    }
    
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
        document.getElementById('movie-vote-count').textContent = movie.vote_count + ' votes';
    }
    
    
    if (movie.release_date) {
        const date = new Date(movie.release_date);
        document.getElementById('movie-release-date').textContent = date.toLocaleDateString('fr-FR');
    }
    
    
    document.getElementById('movie-status').textContent = movie.status || 'Inconnu';
    document.getElementById('movie-language').textContent = movie.original_language || 'N/A';
    
    
    const genresDiv = document.getElementById('movie-genres');
    genresDiv.innerHTML = '';
    if (movie.genres) {
        movie.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre.name;
            genresDiv.appendChild(tag);
        });
    }
    
    
    if (movie.release_dates?.results) {
        const frRelease = movie.release_dates.results.find(r => r.iso_3166_1 === 'FR');
        if (frRelease?.release_dates) {
            const dvdRelease = frRelease.release_dates.find(rd => rd.type === 5 || rd.type === 6);
            if (dvdRelease?.release_date) {
                const dvdDate = new Date(dvdRelease.release_date);
                document.getElementById('movie-dvd-date').textContent = dvdDate.toLocaleDateString('fr-FR');
                document.getElementById('dvd-section').style.display = 'block';
            }
        }
    }
    
    
    const castDiv = document.getElementById('movie-cast');
    castDiv.innerHTML = '';
    if (credits.cast) {
        credits.cast.slice(0, 8).forEach(actor => {
            const actorDiv = document.createElement('div');
            actorDiv.className = 'cast-item';
            actorDiv.innerHTML = `
                <img class="cast-photo" alt="${actor.name}" 
                     src="${actor.profile_path ? 'https://image.tmdb.org/t/p/w200' + actor.profile_path : 'https://via.placeholder.com/150x200/333/fff?text=Photo'}">
                <div class="cast-info">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-role">${actor.character || 'Rôle inconnu'}</div>
                </div>
            `;
            castDiv.appendChild(actorDiv);
        });
    }
}

function showError(msg) {
    document.querySelector('main').innerHTML = `
        <div style="text-align:center; padding:50px;">
            <h2>Erreur</h2>
            <p>${msg || 'Impossible de charger le film'}</p>
            <a href="index.html" class="back-btn">Retour à l'accueil</a>
        </div>
    `;
}

// Charger directement
getMovie();