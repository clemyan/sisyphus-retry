export default {
	input: 'src/index.js',
	output: [
		{file: 'dist/sisyphus.js', format: 'iife', name: 'sisyphus'},
		{file: `dist/sisyphus.cjs.js`, format: 'cjs'},
		{file: `dist/sisyphus.es.js`, format: 'es'}
	],
}
