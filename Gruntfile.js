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
		htmlmin: {
			build: {
				options: {
					removeComments: true,
					removeCommentsFromCDATA: true,
					removeCDATASectionsFromCDATA: true,
					collapseBooleanAttributes: true,
					removeRedundantAttributes: true,
					removeEmptyAttributes: true
				},
				files: {
					'build/index.html': 'index.html'
				}
			},
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
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['uglify', 'cssmin', 'htmlmin', 'copy']);

};