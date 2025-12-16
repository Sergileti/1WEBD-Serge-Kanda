const Cache = {
    dur: 3600000,
    get(k) {
        try {
            const item = JSON.parse(localStorage.getItem(k));
            return item && Date.now() - item.t < this.dur ? item.d : null;
        } catch { return null; }
    },
    set(k, d) {
        try {
            localStorage.setItem(k, JSON.stringify({ d, t: Date.now() }));
        } catch {}
    },
    clean() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.includes('_cache_')) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (Date.now() - item.t > this.dur) localStorage.removeItem(key);
                } catch {}
            }
        }
    }
};

Cache.clean();