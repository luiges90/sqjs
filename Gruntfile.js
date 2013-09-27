module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			build: {
				src: 'js/*.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		cssmin: {
			minify: {
				src: 'css/*.css',
				dest: 'dist/<%= pkg.name %>.min.css'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['uglify', 'cssmin']);

};