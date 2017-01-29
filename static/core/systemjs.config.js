(function (global) {

    System.config({
        paths: {
            // paths serve as alias
            'npm:': '/static/node_modules/'
        },
        // map tells the System loader where to look for things
        map: {
            // angular bundles
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
            '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
            '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
            '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',

            // other libraries
            'rxjs': 'npm:rxjs',

            // the app itself
            'core': "/static/core",
            'adventure': "/static/adventures/" + game_id
        },

        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            'core': {
                main: './main.js',
                defaultExtension: 'js'
            },
            'adventure': {
                main: './main.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: 'js'
            }
        }
    });

})(this);
