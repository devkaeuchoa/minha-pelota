import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                retro: ['VT323', 'monospace'],
            },
            fontSize: {
                xs: ['0.875rem', { lineHeight: '1.25rem' }],
                sm: ['1rem', { lineHeight: '1.5rem' }],
                base: ['1.125rem', { lineHeight: '1.75rem' }],
                lg: ['1.25rem', { lineHeight: '1.75rem' }],
                xl: ['1.5rem', { lineHeight: '2rem' }],
                '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '3xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '4xl': ['3rem', { lineHeight: '1' }],
                '5xl': ['3.75rem', { lineHeight: '1' }],
            },
        },
    },

    plugins: [forms],
};
