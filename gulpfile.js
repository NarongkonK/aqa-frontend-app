const gulp = require('gulp')
const glob = require("glob")
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const async = require('async')
const fs = require('fs')
const cheerio = require('cheerio')
const gulpCopy = require('gulp-copy');
const del = require('del');
const exec = require('child_process').exec;

var argv = require('yargs').argv;
var isProduction = (argv.production === undefined) ? false : true;

let arrPath = [];

gulp.task('route', function () {

    return Promise.all([
        new Promise((resolve, reject) => {
            glob("./src/"+argv.app+"/routes/**/route-*.html", null, (er, files) => {
                arrPath = arrPath.concat(files)
                let elementList = []

                async.each(files, (file, callback) => {

                    console.log('Processing file : ' + file)

                    let splitSlash = file.split('/')
                    let fileName = splitSlash[splitSlash.length - 1]
                    let elementName = fileName.split('.')[0]
                    let pathRoute = '/' + elementName.split('route-')[1].replace('-', '/')
                    let pathFile = file.split('./src/')[1]



                    fs.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            callback(err)
                        }
                        const $ = cheerio.load(data)
                        let domModule = $('dom-module')
                        if ($('dom-module').attr('id') == undefined) {
                            domModule = $('script')
                        }


                        let topic = domModule.attr('topic')

                        elementList.push({
                            elementName,
                            pathFile,
                            pathRoute: domModule.attr('path') || pathRoute,
                            rule: domModule.attr('rule'),
                            topic: domModule.attr('topic'),
                            parentName: domModule.attr('parent')
                        })

                        callback();
                    });

                }, function (err) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        //console.log(elementList)

                        const addAttribute = (name, value) => {
                            if (value != undefined) {

                                if (typeof value == "boolean") {
                                    if (value) {
                                        return name
                                    } else {
                                        return ''
                                    }
                                }
                                return `${name}="${value}"`
                            }
                            return ''
                        }

                        const navigation = (elementNameSource) => {
                            const navigationIn = (elementName) => {
                                let elementNameCut = elementName.split('>')[0]
                                let getPage = elementList.filter((row) => {
                                    return row.elementName == elementNameCut
                                })

                                if (getPage.length != 0) {
                                    if (getPage[0].parentName) {
                                        return navigationIn(getPage[0].parentName + '>' + elementName)
                                    }
                                }

                                return elementName
                            }

                            return navigationIn(elementNameSource).split('>')
                        }

                        let im = ''
                        let el = ''
                        let nav = {}

                        elementList.map((row) => {

                            im = im + `<link rel="lazy-import" href="${row.pathFile}">\n`
                            el = el + `<${row.elementName} ${addAttribute('topic', row.topic)} path-file="${row.pathFile}" path="${row.pathRoute}" ${addAttribute('rule', row.rule)} ${addAttribute('parent', row.parentName)}>`
                            if(row.elementName=="route-index"){
                                el = el + `<slot name="recaptcha" slot="recaptcha"></slot>`
                            }
                            el = el + `</${row.elementName}>\n`
                            
                            nav[row.elementName] = navigation(row.elementName).map((row) => {

                                let eln = elementList.filter((row2) => {
                                    return row2.elementName == row
                                })[0]

                                return {
                                    elementName: row,
                                    url: eln.pathRoute,
                                    label: eln.topic
                                }
                            })
                        })

                        let layoutName = argv.layout || "layout-main"

                        gulp.src(['./src/nylon-init-template.html'])
                            .pipe(replace('<!-- [[gen_import]] -->', im))
                            .pipe(replace('<!-- [[gen_route]] -->', el))
                            .pipe(replace('[[app_folder]]', argv.app))
                            .pipe(replace('layout-main', layoutName))
                            .pipe(replace('gen_navigation', JSON.stringify(nav)))
                            .pipe(rename('nylon-init.html'))
                            .pipe(gulp.dest('./src/'))
                            .on('end', resolve)
                        gulp.start('dialog');

                    }
                });


            })
        })
    ])

    

});



gulp.task('dialog', () => {
    return Promise.all([
        new Promise((resolve, reject) => {
            glob("./src/"+argv.app+"/routes/**/dialog-*.html", null, (er, files) => {
                arrPath = arrPath.concat(files)
                let elementList = []

                async.each(files, (file, callback) => {

                    console.log('Processing file : ' + file)

                    let splitSlash = file.split('/')
                    let fileName = splitSlash[splitSlash.length - 1]
                    let elementName = fileName.split('.')[0]
                    let pathRoute = '/' + elementName.split('dialog-')[1].replace('-', '/')
                    let pathFile = file.split('./src/')[1]



                    fs.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            callback(err)
                        }
                        const $ = cheerio.load(data)
                        let domModule = $('dom-module')
                        if ($('dom-module').attr('id') == undefined) {
                            domModule = $('script')
                        }


                        let topic = domModule.attr('topic')

                        elementList.push({
                            elementName,
                            pathFile,
                            pathRoute: domModule.attr('path') || pathRoute,
                            rule: domModule.attr('rule') != undefined,
                            topic: domModule.attr('topic')
                        })

                        callback();
                    });

                }, function (err) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        //console.log(elementList)

                        const addAttribute = (name, value) => {
                            if (value != undefined) {

                                if (typeof value == "boolean") {
                                    if (value) {
                                        return name
                                    } else {
                                        return ''
                                    }
                                }
                                return `${name}="${value}"`
                            }
                            return ''
                        }

                        const navigation = (elementNameSource) => {
                            const navigationIn = (elementName) => {
                                let elementNameCut = elementName.split('>')[0]
                                let getPage = elementList.filter((row) => {
                                    return row.elementName == elementNameCut
                                })

                                if (getPage.length != 0) {
                                    if (getPage[0].parentName) {
                                        return navigationIn(getPage[0].parentName + '>' + elementName)
                                    }
                                }

                                return elementName
                            }

                            return navigationIn(elementNameSource).split('>')
                        }

                        let im = ''
                        let el = ''

                        elementList.map((row) => {
                            im = im + `<link rel="lazy-import" href="${row.pathFile}">\n`
                            el = el + `<${row.elementName} ${addAttribute('label', row.topic)} path-file="${row.pathFile}" path="${row.pathRoute}" lazy></${row.elementName}>\n`

                        })


                        gulp.src(['./src/nylon-init.html'])
                            .pipe(replace('<!-- [[gen_import_dialog]] -->', im))
                            .pipe(replace('<!-- [[gen_dialog]] -->', el))
                            .pipe(gulp.dest('./src/'))
                            .on('end', resolve)
                        gulp.start('polymer');
                    }
                });


            })
        })
    ])



});

gulp.task('polymer', function (done) {

    const comArr = (arr)=>{
        let txt = ""
        arr.map((row,i)=>{
            txt = txt+`\t\t"${row}"`
            if(i<arr.length-1){
                txt = txt+`,\n`
            }
        })
        return txt
    }

    gulp.src('./polymer-template.json')
        .pipe(replace(`"fragments": [],`, `"fragments": [\n${comArr(arrPath)}\n\t],`))
        .pipe(rename('polymer.json'))
        .pipe(gulp.dest('./'))

        .on('end', done)



})




// const myRename = function (source, destination) {
//     return new Promise(function (resolve, reject) {
//         fs.rename(source, destination, function (err) {
//             if (err) {
//                 throw err;
//             }
//             resolve();
//         });
//     })
// }

// gulp.task('build:rename', function () {
//     return Promise.all([
//         myRename('src/frontend', 'src/_frontend')
//     ])
// })

// gulp.task('build:copy', function (done) {
//     return gulp.src(['../frontend/**/*']).pipe(gulp.dest('src/frontend'));
// })

// gulp.task('build:del', function (done) {
//     del(['src/frontend']).then(paths => {
//         done()
//     });
// })

// gulp.task('build:undo_rename', function () {
//     return Promise.all([
//         myRename('src/_frontend', 'src/frontend')
//     ])
// })

gulp.task('build', function (done) {
    return gulp.src('./bower_components/webcomponentsjs/custom-elements-es5-adapter.js')
    .pipe(gulp.dest('./build/es5-bundled/bower_components/webcomponentsjs/'));
})
