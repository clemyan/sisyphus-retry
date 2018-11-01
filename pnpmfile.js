const additions = {
	'babel-plugin-minify-guarded-expressions': {
		dependencies: {
			'babel-helper-evaluate-path': '^0.5.0'
		}
	},
	'babel-plugin-minify-simplify': {
		dependencies: {
			'babel-helper-evaluate-path': '^0.5.0'
		}
	},

}

module.exports = {
	hooks: {
		readPackage(pkg, {log}) {
			if(additions[pkg.name]) {
				for(const key of Object.keys(additions[pkg.name])) {
					log(`Adding ${key} to ${pkg.name}: ${JSON.stringify(additions[pkg.name][key], null, 4)}`)
					Object.assign(pkg[key], additions[pkg.name][key])
				}
			}
			return pkg
		}
	}
}
