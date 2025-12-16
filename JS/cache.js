const Cache = {
    dur: 3600000,
    
    get(k) {
        try {
            const item = JSON.parse(localStorage.getItem(k));
            
            if (item && item.apiTokenHash) {
                const currentTokenHash = this.getTokenHash();
                if (item.apiTokenHash !== currentTokenHash) {
                    
                    localStorage.removeItem(k);
                    return null;
                }
            }
            return item && Date.now() - item.t < this.dur ? item.d : null;
        } catch { 
            return null; 
        }
    },
    
    set(k, d) {
        try {
            const item = {
                d: d,
                t: Date.now(),
                apiTokenHash: this.getTokenHash()
            };
            localStorage.setItem(k, JSON.stringify(item));
        } catch (e) {
            console.error('Erreur de cache:', e);
        }
    },
    
    getTokenHash() {
        
        if (!TMDB_API_TOKEN) return 'no_token';
        return btoa(TMDB_API_TOKEN.substring(0, 10) + TMDB_API_TOKEN.length).replace(/[^a-zA-Z0-9]/g, '');
    },
    
    clean() {
        const currentTokenHash = this.getTokenHash();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item) {
                    
                    const isExpired = Date.now() - item.t > this.dur;
                    const isWrongToken = item.apiTokenHash && item.apiTokenHash !== currentTokenHash;
                    
                    if (isExpired || isWrongToken) {
                        localStorage.removeItem(key);
                        i--; 
                    }
                }
            } catch {
                
                localStorage.removeItem(key);
                i--;
            }
        }
    },
    
    clearAll() {
        
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('films_') || 
                        key.startsWith('search_') || 
                        key.startsWith('movie_') ||
                        key.includes('_cache_'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('Cache vidé:', keysToRemove.length, 'éléments supprimés');
    }
};


Cache.clean();


if (typeof TMDB_API_TOKEN !== 'undefined') {
    const lastTokenKey = 'last_api_token';
    const currentTokenHash = Cache.getTokenHash();
    const lastTokenHash = localStorage.getItem(lastTokenKey);
    
    if (lastTokenHash && lastTokenHash !== currentTokenHash) {
        console.log('Token API changé, nettoyage du cache...');
        Cache.clearAll();
    }
    
    localStorage.setItem(lastTokenKey, currentTokenHash);
}