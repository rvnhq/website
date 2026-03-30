/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    // We drive theming via data-theme attribute + CSS variables,
    // not Tailwind's built-in dark mode class, to avoid conflicts.
    darkMode: ['selector', '[data-theme="dark"]'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['Geist Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                accent: 'var(--accent)',
                border: 'var(--border)',
                bg: 'var(--bg)',
                fg: 'var(--fg)',
                muted: 'var(--fg-muted)',
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
                pill: 'var(--radius-pill)',
            },
            transitionTimingFunction: {
                ease: 'var(--ease)',
            },
        },
    },
    plugins: [],
};
