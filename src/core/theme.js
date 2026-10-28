// Theme Management (Dark & Light Mode)

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'azmi_portfolio_theme';
        // Ambil preferensi dari localStorage atau deteksi preferensi sistem (default 'dark')
        const saved = localStorage.getItem(this.STORAGE_KEY);
        this.currentTheme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        this.listeners = [];

        this.applyTheme(this.currentTheme, false);
    }

    getTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') return;
        this.currentTheme = theme;
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.applyTheme(theme, true);
    }

    toggleTheme() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
        return nextTheme;
    }

    applyTheme(theme, notify = true) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update semua tombol toggle di DOM jika ada
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        toggleButtons.forEach(btn => {
            const isLight = theme === 'light';
            btn.innerHTML = isLight 
                ? '<span class="theme-icon">🌙</span><span class="theme-text">Dark Mode</span>' 
                : '<span class="theme-icon">☀️</span><span class="theme-text">Light Mode</span>';
            btn.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
            btn.setAttribute('title', `Switch to ${isLight ? 'dark' : 'light'} mode`);
        });

        if (notify) {
            this.listeners.forEach(cb => {
                try {
                    cb(theme);
                } catch (e) {
                    console.error('Error in theme listener:', e);
                }
            });
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        // Panggil langsung untuk inisialisasi
        callback(this.currentTheme);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
}

export const themeManager = new ThemeManager();
