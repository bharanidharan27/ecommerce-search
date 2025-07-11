import { defineConfig} from 'vite' // provides typeScript support and autocompletion for config object
import react from '@vitejs/plugin-react' // enables react support in vite

export default defineConfig({
    plugins: [react()], // jsx transformation, react fast refresh
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
})