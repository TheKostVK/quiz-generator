import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',

    server: {
        port: 5173,
        open: true,
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true,

        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                quizzes: resolve(__dirname, 'quizzes.html'),
                quiz: resolve(__dirname, 'quiz.html'),
            },
        },
    },

    optimizeDeps: {
        include: ['zod', 'idb', 'nanoid'],
    },
});