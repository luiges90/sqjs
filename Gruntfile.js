module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			build: {
				src: 'js/*.js',
				dest: 'build/sq.min.js'
			}
		},
		cssmin: {
			build: {
				src: 'css/*.css',
				dest: 'build/sq.min.css'
			}
		},
		processhtml: {
			build: {
				files: {
					'build/index.html': 'sqjs.html'
				}
			}
		},
		'string-replace': {
			build: {
				files: {
					'build/index.html': 'build/index.html'
				},
				options: {
					replacements: [{
						pattern: /<%lastUpdate%>/ig,
						replacement: '2013-10-6'
					}, {
						pattern: /<%gitRepo%>/ig,
						replacement: 'sqjs'
					}]
				}
			}
		},
		copy: {
			build: {
				files: [
					{expand: true, src: ['img/*.png', 'sound/**'], dest: 'build/'},
					{expand: true, src: ['lib/Box2dWeb-2.1.a.3.min.js'], dest: 'build/'},
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['uglify', 'cssmin', 'processhtml', 'string-replace', 'copy']);

};