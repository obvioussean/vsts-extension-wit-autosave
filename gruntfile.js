module.exports = function (grunt) {
    grunt.initConfig({
        copy: {
            scripts: {
                files: [{
                    expand: true, 
                    flatten: true, 
                    src: ["node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js"], 
                    dest: "scripts",
                    filter: "isFile" 
                }]
            }
        },
        typings: {
            install: {}
        },
        ts: {
            build: {
                tsconfig: true
            },
            options: {
                fast: "never"
            }
        },
        exec: {
            package_dev: {
                command: "tfx extension create --manifest-globs vss-extension.json --overrides-file configs/dev.json",
                stdout: true,
                stderr: true
            },
            package_release: {
                command: "tfx extension create --manifest-globs vss-extension.json --overrides-file configs/release.json",
                stdout: true,
                stderr: true
            },
            publish_dev: {
                command: "tfx extension publish --service-url https://marketplace.visualstudio.com --manifest-globs vss-extension.json --overrides-file configs/dev.json",
                stdout: true,
                stderr: true
            },
            publish_release: {
                command: "tfx extension publish --service-url https://marketplace.visualstudio.com --manifest-globs vss-extension.json --overrides-file configs/release.json",
                stdout: true,
                stderr: true
            }
        },

        clean: ["scripts/**/*.js", "typings", "node_modules", "*.vsix"]
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-typings");

    grunt.registerTask("install", ["typings:install"]);
    grunt.registerTask("build", ["ts:build"]);
    grunt.registerTask("package-dev", ["build", "copy:scripts", "exec:package_dev"]);
    grunt.registerTask("package-release", ["build", "copy:scripts", "exec:package_release"]);
    grunt.registerTask("publish-dev", ["package-dev", "exec:publish_dev"]);        
    grunt.registerTask("publish-release", ["package-release", "exec:publish_release"]);    

    grunt.registerTask("default", ["package-dev"]);
};