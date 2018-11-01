module.exports = {
	extends: 'eslint:recommended',
	rules: {
		'indent': ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		'eol-last': ['error', 'always'],
		'semi': ['error', 'never'],
		'space-before-blocks': ['error'],
		'key-spacing': ['error', {mode: 'minimum'}],
		'keyword-spacing': ['error', {
			overrides: {
				if: {after: false},
				for: {after: false},
				while: {after: false},
				switch: {after :false},
				catch: {after: false},
				function: {after: false}
			}
		}],
		'space-before-function-paren': ['warn', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'always'
		}],
	},
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	env:{
		es6: true,
		node: true,
	}
}