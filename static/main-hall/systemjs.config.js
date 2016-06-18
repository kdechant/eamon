(function (global) {

    // map tells the System loader where to look for things
    var map = {
        'rxjs': '/static/node_modules/rxjs',
        '@angular':                   '/static/node_modules/@angular',
        '@angular-router':            '/static/node_modules/@angular-router',
        'core': "/static/core",
        'main_hall': "/static/main-hall",
        'adventure': "/static/adventures/demo1"
    };

    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'rxjs': {defaultExtension: 'js'},
        'angular2-in-memory-web-api': {defaultExtension: 'js'},
        'core': { defaultExtension: 'js' },
        'main_hall': { defaultExtension: 'js' },
        'adventure': { defaultExtension: 'js' },
    };

    var packageNames = [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router',
        '@angular/testing',
        '@angular/upgrade',
    ];

    // add package entries for angular packages in the form '@angular/common': { main: 'index.js', defaultExtension: 'js' }
    packageNames.forEach(function (pkgName) {
        packages[pkgName] = {main: 'index.js', defaultExtension: 'js'};
    });

    var config = {
        map: map,
        packages: packages
    }

    // filterSystemConfig - index.html's chance to modify config before we register it.
    if (global.filterSystemConfig) {
        global.filterSystemConfig(config);
    }

    System.config(config);

})(this);
