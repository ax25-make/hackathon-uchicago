import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': '/src',
			'@assets': '/src/assets',
			'@components': '/src/components',
			'@hooks': '/src/hooks',
			'@utils': '/src/utils',
		},
	},
	server: {
		host: true, // Important: Allows external access
		port: 5173, // Your port
		allowedHosts: ['.ngrok.io', '.ngrok.app'], // Allow ngrok URLs
	},
});
