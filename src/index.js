// Import compiled Tailwind CSS so the browser requests it
import './index.css';

// Minimal fallback app (no React required). Ensure your HTML contains <div id="root"></div>
const root = document.getElementById('root');
if (root) {
	root.innerHTML = `
		<div class="min-h-screen flex items-center justify-center p-6">
			<h1 class="text-4xl font-bold">Smart Budget — App running</h1>
		</div>
	`;
} else {
	console.error('Root element not found. Add <div id="root"></div> to your index.html.');
}