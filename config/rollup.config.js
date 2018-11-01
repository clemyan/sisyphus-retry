import minify from 'rollup-plugin-babel-minify'

export default {
	input: 'src/index.js',
	output: [
		{file: 'dist/sisyphus.js', format: 'iife', name: 'sisyphus'},
		{file: 'dist/umd/sisyphus.js', format: 'umd', name: 'sisyphus'},
		{file: `dist/cjs/sisyphus.js`, format: 'cjs'},
		{file: `dist/es/sisyphus.js`, format: 'es'}
	],
	plugins: [
		minify({comments: false})
	],
	watch: {
		inlude: 'src/**/*.js'
	}
}
