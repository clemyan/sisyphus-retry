import minify from 'rollup-plugin-babel-minify'

import main from './rollup/main.js'
import wait from './rollup/wait.js'

const minifyPlugin = minify({comments: false})

export default (async () => [
	main,
	...await wait
].map(config => {
	config.plugins = (config.plugins || []).concat([minifyPlugin])
	return config
}))()
