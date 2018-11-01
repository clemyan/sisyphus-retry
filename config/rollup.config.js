import minify from 'rollup-plugin-babel-minify'

export default {
	input: 'src/index.js',
	output: [
		{file: 'dist/index.js', format: 'iife', name: 'sisyphus'},
		{file: 'dist/umd/index.js', format: 'umd', name: 'sisyphus'},
		{file: `dist/cjs/index.js`, format: 'cjs'},
		{file: `dist/es/index.js`, format: 'es'}
	],
	plugins: [
		minify({comments: false})
	],
	watch: {
		inlude: 'src/**/*.js'
	}
}
