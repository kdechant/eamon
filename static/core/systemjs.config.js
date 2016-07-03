(function (global) {

    // map tells the System loader where to look for things
    var map = {
        'rxjs': '/static/node_modules/rxjs',
        '@angular': '/static/node_modules/@angular',
        'core': "/static/core",
        'adventure': "/static/adventures/" + game_id
    };

    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'rxjs': {defaultExtension: 'js'},
        'core': { defaultExtension: 'js' },
        'adventure': { defaultExtension: 'js' },
    };

    var packageNames = [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/forms',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/testing'
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

    // var systemLocate = System.locate;
    // System.locate = function (load) {
    //     var System = this; // its good to ensure exact instance-binding
    //     return Promise.resolve(systemLocate.call(this, load)).then(function (address) {
    //         if (address.indexOf("node_modules") == -1) {
    //             // app code - bust cache
    //             return address + System.cacheBust;
    //         } else {
    //             // angular stuff - OK to be cached
    //             return address;
    //         }
    //     });
    // }
    // System.cacheBust = '?v=' + Math.random();

})(this);
