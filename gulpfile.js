process.chdir('app');

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var gulpbabel = require('gulp-babel');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var clean = require('del');
var streamqueue = require('streamqueue');
var sequence = require('run-sequence');
var rename = require('gulp-rename');
var htmlreplace = require('gulp-html-replace');

var root = '../dist',
    bowerDir = 'bower_components';
var output = {
    root: root,
    css: root + '/css',
    js: root + '/js',
    html: root,
    images: root + '/images'
};

var outputName = {
    background: 'background.js',
    contetScript: 'script.js',
    main: 'app.js',
    manifest: 'manifest.json',
    style: 'style.css'
}

var lib = {
    jQuery: bowerDir + '/jquery/dist/jquery.min.js',
    bootstrap: bowerDir + '/bootstrap/dist/js/bootstrap.min.js',
    angular: bowerDir + '/angular/angular.min.js'
};

var styleLib = {
    bootstrapCore : bowerDir + '/bootstrap/dist/css/bootstrap.css',
    bootstrapCyborg : bowerDir + '/components-bootstrap-cyborg/css/bootstrap.css'
}

function babel() {
    return gulpbabel({
        presets: ['es2015']
    });
}

function queue() {
    return streamqueue.apply(null, [{
        objectMode: true
    }].concat(Array.prototype.slice.call(arguments)))
}

function useJQuery(src) {
    // Unable to use 'merge' because Merge append jQuery after src
    return queue(gulp.src(lib.jQuery), src)
}

gulp.task('clean', function() {
    return clean('./dist/*', {
        force: true
    });
});

gulp.task('sass', function sass_Task() {
    return gulp.src('sass/*.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest('css'));
});

gulp.task('circle', function circle_Task() {
    var less = require('gulp-less');
    return gulp.src('bower_components/css-percentage-circle/less/circle.less')
    .pipe(less()).pipe(gulp.dest('css'));
});


// --------------


gulp.task('css', function css_Task() {
    var appStyle = gulp.src('sass/style.scss').pipe(sass().on('error', sass.logError));

    var bootstrapStyle = gulp.src([styleLib.bootstrapCore, styleLib.bootstrapCyborg]);

    var appStyle = queue(bootstrapStyle, appStyle).pipe(concat(outputName.style));
    var injectStyle = gulp.src('sass/inject.scss').pipe(sass());

    return merge(appStyle, injectStyle).pipe(gulp.dest(output.css));
});

gulp.task('jsBackground', function jsBackground_Task() {
    return gulp.src('es6/background.js').pipe(babel()).pipe(uglify()).pipe(gulp.dest(output.js))
})

gulp.task('jsContentScript', function jsContentScript_Task() {
    return useJQuery(
        gulp.src('es6/script.js').pipe(babel()).pipe(uglify())
    ).pipe(concat(outputName.contetScript)).pipe(gulp.dest(output.js))
})

gulp.task('jsMain', function jsMain_Task() {
    return queue(
            gulp.src(lib.jQuery),
            gulp.src(lib.bootstrap),
            gulp.src(lib.angular),
            gulp.src(['es6/app.js', 'es6/service.js'])
            .pipe(babel())
            .pipe(uglify()).pipe(concat('tmp.js'))
        )
        .pipe(concat(outputName.main))
        .pipe(gulp.dest(output.js));
});
gulp.task('js', ['jsMain', 'jsContentScript', 'jsBackground']);

gulp.task('html', function html_Task() {
    //return gulp.src('*.html').pipe(gulp.dest(output.html));
    return gulp.src('index.html')
        .pipe(htmlreplace())
        .pipe(gulp.dest(output.html));
        // {
        //             'css': 'css/style.css',
        //             'js': 'js/' + outputName.main
        //         }
});

gulp.task('images', function images_Task() {
    return gulp.src('images/*').pipe(gulp.dest(output.images))
});


gulp.task('production', function production_Task() {
    var fs = require('fs'),
        manifest = require('./app/manifest.json'),
        dest = output.root + '/' + outputName.manifest;

    manifest.content_scripts = manifest.content_scripts_dist;
    delete manifest.content_scripts_dist;

    fs.mkdir(output.root, function() {});
    fs.writeFileSync(dest, JSON.stringify(manifest));

    return gulp.src(dest)
});


gulp.task('pack', function pack_Task(done) {
    var chrome = chromePath();
    var spawn = require('child_process').spawn;
    var cwd = process.cwd();
    var params = [
            // '',
            '--pack-extension=' + 'd:/Working/Programming/GitHub/csn-downloader/dist'
        ],
        stdout = '',
        stderr = '';

    // console.log("cwd", chrome + params.join(' '));
    // var child = spawn(chrome + params.join(' '));
    var child = spawn(chrome, params);
    // console.log("child", child.argv);

    // child.stdout.setEncoding('utf8');

    // child.stdout.on('data', function(data) {
    //     stdout += data;
    //     console.log(data);
    // });

    // child.stderr.setEncoding('utf8');
    // child.stderr.on('data', function(data) {
    //     stderr += data;
    //     console.log((data));
    // });


    child.on('close', function(code) {
        console.log("code", code);
        console.log("stderr", stderr);
        console.log("stdout", stdout);
        done();
    });

})

gulp.task('build', ['css', 'js', 'html', 'images']);

gulp.task('default', ['build', 'production']);

// "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=c:\Users\Reegan\desktop\dist --pack-extension-key=c:\Users\Reegan\desktop\dist.pem


function chromePath() {
    var isWin = /^win/.test(process.platform),
        env = process.env,
        chrome;
    if (isWin) {
        var programFile = env['ProgramFiles(x86)'] || env['ProgramFiles'];
        return programFile + "\\Google\\Chrome\\Application\\chrome.exe";
    }
    // Linux
}