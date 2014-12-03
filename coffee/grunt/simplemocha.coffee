module.exports = 
	options: 
		globals: ['should', 'chai', 'sinon']
		timeout: 3000
		ignoreLeaks: false
		ui: 'tdd'
		reporter: 'nyan'

	all:
		src: ['test/**/*.js']