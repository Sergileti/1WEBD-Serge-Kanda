const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGIwMTk2Y2NjNTI2ODY0NWQyNzAwOTViMzk0YTViNiIsIm5iZiI6MTc2NTM1NTM2NC4zNTIsInN1YiI6IjY5MzkyZjY0ZDNhNTYxMGMyYjEzNGMxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CmmGG6ereMWpDbFfH1JXfJWsozIfAqcrTQLd9KxufeI';

const url = new URL(window.location.href);
const movieId = url.searchParams.get('id');

async function getMovie() {
    if (!movieId) {
        showError();
        return;
    }
    
    try {
        // Afficher le chargement
        showLoading();
        
        // Récupérer les informations du film
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=fr-FR`;
        const movieRes = await fetch(movieUrl, {
            headers: {
                'Authorization': 'Bearer ' + TOKEN
            }
        });
        
        if (!movieRes.ok) {
            throw new Error('Erreur lors du chargement du film');
        }
        
        const movie = await movieRes.json();
        
        // Récupérer le casting
        const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=fr-FR`;
        const creditsRes = await fetch(creditsUrl, {
            headers: {
                'Authorization': 'Bearer ' + TOKEN
            }
        });
        
        if (!creditsRes.ok) {
            throw new Error('Erreur lors du chargement du casting');
        }
        
        const credits = await creditsRes.json();
        
        showMovie(movie, credits);
        
    } catch (error) {
        console.error('Erreur:', error);
        showError();
    }
}

function showLoading() {
    document.getElementById('movie-title').textContent = 'Chargement...';
    document.getElementById('movie-overview').textContent = 'Chargement des informations...';
    document.getElementById('movie-poster').src = '';
    document.getElementById('movie-genres').innerHTML = '<span class="genre-tag">Chargement...</span>';
    document.getElementById('movie-cast').innerHTML = '<div style="text-align:center; padding:20px; color:#aaa;">Chargement du casting...</div>';
}

function showMovie(movie, credits) {
    // Titre et meta
    document.getElementById('movie-title').textContent = movie.title;
    document.title = movie.title + ' - CinemaTor';
    
    // Poster
    if (movie.poster_path) {
        document.getElementById('movie-poster').src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
        document.getElementById('movie-poster').onerror = function() {
            this.src = 'https://via.placeholder.com/500x750/333/fff?text=Poster+non+disponible';
        };
    } else {
        document.getElementById('movie-poster').src = 'https://via.placeholder.com/500x750/333/fff?text=Poster+non+disponible';
    }
    
    // Synopsis
    document.getElementById('movie-overview').textContent = movie.overview || 'Pas de synopsis disponible.';
    
    // Informations de base avec icônes
    if (movie.release_date) {
        const year = movie.release_date.substring(0, 4);
        document.getElementById('movie-year').innerHTML = `<i class="fas fa-calendar-alt"></i> ${year}`;
    } else {
        document.getElementById('movie-year').innerHTML = `<i class="fas fa-calendar-alt"></i> N/A`;
    }
    
    if (movie.runtime) {
        const hours = Math.floor(movie.runtime / 60);
        const minutes = movie.runtime % 60;
        const runtimeText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
        document.getElementById('movie-runtime').innerHTML = `<i class="fas fa-clock"></i> ${runtimeText}`;
        document.getElementById('movie-duration').textContent = runtimeText;
    } else {
        document.getElementById('movie-runtime').innerHTML = `<i class="fas fa-clock"></i> N/A`;
        document.getElementById('movie-duration').textContent = 'N/A';
    }
    
    if (movie.vote_average && movie.vote_average > 0) {
        const rating = movie.vote_average.toFixed(1);
        document.getElementById('movie-rating').innerHTML = `<i class="fas fa-star"></i> ${rating}/10`;
        document.getElementById('movie-vote-average').textContent = rating + '/10';
        document.getElementById('movie-vote-count').textContent = movie.vote_count.toLocaleString('fr-FR') + ' votes';
    } else {
        document.getElementById('movie-rating').innerHTML = `<i class="fas fa-star"></i> N/A`;
        document.getElementById('movie-vote-average').textContent = 'N/A';
        document.getElementById('movie-vote-count').textContent = '0 vote';
    }
    
    // Date de sortie formatée
    if (movie.release_date) {
        const date = new Date(movie.release_date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formatted = date.toLocaleDateString('fr-FR', options);
        document.getElementById('movie-release-date').textContent = formatted;
    } else {
        document.getElementById('movie-release-date').textContent = 'Date non disponible';
    }
    
    // Statut
    document.getElementById('movie-status').textContent = translateStatus(movie.status) || 'Inconnu';
    
    // Langue
    document.getElementById('movie-language').textContent = getLanguageName(movie.original_language) || movie.original_language || 'N/A';
    
    // Genres
    const genresDiv = document.getElementById('movie-genres');
    genresDiv.innerHTML = '';
    if (movie.genres && movie.genres.length > 0) {
        movie.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre.name;
            genresDiv.appendChild(tag);
        });
    } else {
        const tag = document.createElement('span');
        tag.className = 'genre-tag';
        tag.textContent = 'Non spécifié';
        genresDiv.appendChild(tag);
    }
    
    // Date DVD
    if (movie.release_dates && movie.release_dates.results) {
        const frRelease = movie.release_dates.results.find(r => r.iso_3166_1 === 'FR');
        if (frRelease && frRelease.release_dates) {
            const dvdRelease = frRelease.release_dates.find(rd => rd.type === 5 || rd.type === 6);
            if (dvdRelease && dvdRelease.release_date) {
                const dvdDate = new Date(dvdRelease.release_date);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                document.getElementById('movie-dvd-date').textContent = dvdDate.toLocaleDateString('fr-FR', options);
                document.getElementById('dvd-section').style.display = 'block';
            }
        }
    }
    
    // Casting
    const castDiv = document.getElementById('movie-cast');
    castDiv.innerHTML = '';
    if (credits.cast && credits.cast.length > 0) {
        const topActors = credits.cast.slice(0, 12); // Augmenté à 12 acteurs
        topActors.forEach(actor => {
            const actorDiv = document.createElement('div');
            actorDiv.className = 'cast-item';
            
            const img = document.createElement('img');
            img.className = 'cast-photo';
            img.alt = actor.name;
            img.loading = 'lazy';
            
            if (actor.profile_path) {
                img.src = 'https://image.tmdb.org/t/p/w200' + actor.profile_path;
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/200x300/333/fff?text=' + encodeURIComponent(actor.name.charAt(0));
                };
            } else {
                img.src = 'https://via.placeholder.com/200x300/333/fff?text=' + encodeURIComponent(actor.name.charAt(0));
            }
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'cast-info';
            
            const name = document.createElement('div');
            name.className = 'cast-name';
            name.textContent = actor.name;
            
            const role = document.createElement('div');
            role.className = 'cast-role';
            role.textContent = actor.character || 'Rôle non spécifié';
            
            infoDiv.appendChild(name);
            infoDiv.appendChild(role);
            
            actorDiv.appendChild(img);
            actorDiv.appendChild(infoDiv);
            
            castDiv.appendChild(actorDiv);
        });
        
        // Si peu d'acteurs, ajuster le layout
        if (topActors.length < 4) {
            castDiv.style.gridTemplateColumns = `repeat(${topActors.length}, 1fr)`;
        }
    } else {
        castDiv.innerHTML = '<div style="text-align:center; padding:30px; color:#aaa;"><i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px;"></i><p>Casting non disponible</p></div>';
    }
}

function translateStatus(status) {
    const statusMap = {
        'Released': 'Sorti',
        'In Production': 'En production',
        'Post Production': 'Post-production',
        'Planned': 'Planifié',
        'Rumored': 'Rumeur',
        'Canceled': 'Annulé'
    };
    return statusMap[status] || status;
}

function getLanguageName(code) {
    const languages = {
        'en': 'Anglais',
        'fr': 'Français',
        'es': 'Espagnol',
        'de': 'Allemand',
        'it': 'Italien',
        'ja': 'Japonais',
        'ko': 'Coréen',
        'zh': 'Chinois',
        'ru': 'Russe',
        'pt': 'Portugais',
        'hi': 'Hindi',
        'ar': 'Arabe'
    };
    return languages[code] || code;
}

function showError(message = '') {
    document.querySelector('main').innerHTML = `
        <div class="error-container" style="text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
            <div style="font-size: 4rem; color: #e50914; margin-bottom: 20px;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2 style="color: white; margin-bottom: 15px; font-size: 28px;">Erreur</h2>
            <p style="color: #aaa; margin-bottom: 25px; font-size: 16px;">
                ${message || 'Impossible de charger les informations du film. Le film peut ne pas exister ou il y a un problème de connexion.'}
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="index.html" class="back-btn" style="background: #e50914; padding: 12px 25px; text-decoration: none; border-radius: 4px; color: white; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-home"></i> Accueil
                </a>
                <a href="search.html" class="back-btn" style="background: #333; padding: 12px 25px; text-decoration: none; border-radius: 4px; color: white; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-search"></i> Rechercher un film
                </a>
                <button onclick="window.location.reload()" class="back-btn" style="background: #1e90ff; border: none; padding: 12px 25px; border-radius: 4px; color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
            <div style="margin-top: 40px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; text-align: left;">
                <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Détails techniques :</p>
                <p style="color: #888; font-size: 12px; font-family: monospace;">
                    Movie ID: ${movieId || 'Non spécifié'}<br>
                    URL: ${window.location.href}
                </p>
            </div>
        </div>
    `;
}

// Ajouter un message si aucun ID de film
if (!movieId) {
    showError('Aucun film sélectionné. Veuillez choisir un film depuis la liste.');
}

// Gérer les erreurs de chargement d'images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        if (e.target.classList.contains('movie-poster')) {
            e.target.src = 'https://via.placeholder.com/500x750/333/fff?text=Poster+non+disponible';
        } else if (e.target.classList.contains('cast-photo')) {
            const initial = e.target.alt ? e.target.alt.charAt(0) : '?';
            e.target.src = 'https://via.placeholder.com/200x300/333/fff?text=' + encodeURIComponent(initial);
        }
    }
}, true);

// Ajouter un bouton "Retour en haut"
function addBackToTopButton() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #e50914;
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.background = '#ff2e2e';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.background = '#e50914';
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });
}

// Charger le film quand la page est prête
window.onload = function() {
    console.log('🎬 Page de détails du film prête');
    console.log('ID du film:', movieId);
    
    addBackToTopButton();
    getMovie();
    
    // Ajouter un événement pour le bouton retour
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('back-btn') || e.target.closest('.back-btn')) {
            e.preventDefault();
            window.history.back();
        }
    });
};

// Ajouter un favicon dynamique si possible
try {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'https://image.tmdb.org/t/p/w32' + (movie.poster_path || '/wwemzKWzjKYJFfCeiB57q3r4Bcm.png');
    document.head.appendChild(link);
} catch (e) {
    // Ignorer les erreurs
}