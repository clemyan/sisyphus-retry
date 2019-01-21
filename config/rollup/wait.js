import { promisify } from 'util'
import glob from 'glob'
import virtual from 'rollup-plugin-virtual'

const ENTRY = '__entry'
const iifeEntry = match => `
import sisyphus from 'sisyphus'
import exp from './${match.input}'
if(sisyphus) {
	sisyphus.wait = sisyphus.wait || Object.create(null)
	sisyphus.wait.${match[1]} = exp
}
`

export default promisify(glob)('src/wait/*.js').then(paths =>
	paths.map(RegExp.prototype.exec.bind(/(\w+)\.js$/)).map(match => [
		{
			input: ENTRY,
			output: {file: `dist/wait/${match[1]}.js`, format: 'iife', globals: {sisyphus: 'sisyphus'}},
			external: ['sisyphus'],
			plugins: [virtual({
				[ENTRY]: iifeEntry(match)
			})],
		}, {
			input: match.input,
			output: [
				{file: `dist/wait/${match[1]}.cjs.js`, format: 'cjs'},
				{file: `dist/wait/${match[1]}.es.js`, format: 'es'}
			],
		},
	]).reduce((a,b) => a.concat(b))
)
