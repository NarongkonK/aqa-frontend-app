const gulp = require('gulp')
const glob = require("glob")
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const async = require('async')
const fs = require('fs')
const cheerio = require('cheerio')
const gulpCopy = require('gulp-copy');
const del = require('del');

gulp.task('route', function () {

    return Promise.all([
        new Promise(function(resolve, reject) {
            glob("./src/routes/**/route-*.html", null, function (er, files) {

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
                        if($('dom-module').attr('id') == undefined){
                            domModule = $('script')
                        }
                        
        
                        let topic = domModule.attr('topic')
        
                        elementList.push({
                            elementName,
                            pathFile,
                            pathRoute: domModule.attr('path') || pathRoute,
                            rule: domModule.attr('rule') != undefined,
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
                            if(value != undefined){
        
                                if(typeof value == "boolean"){
                                     if(value){
                                         return name
                                     }else{
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
        
                        elementList.map((row)=>{

                            im = im + `<link rel="lazy-import" href="${row.pathFile}">\n`
                            el = el + `<${row.elementName} ${addAttribute('topic', row.topic)} path-file="${row.pathFile}" path="${row.pathRoute}" ${addAttribute('rule',row.rule)} ${addAttribute('parent',row.parentName)}></${row.elementName}>\n`
                            nav[row.elementName] = navigation(row.elementName).map((row)=>{
        
                                let eln = elementList.filter((row2)=>{
                                    return row2.elementName == row
                                })[0]
        
                                return {
                                    elementName: row,
                                    url: eln.pathRoute,
                                    label: eln.topic
                                }
                            })
                        })
        
        
                        gulp.src(['./src/nylon-init-template.html'])
                            .pipe(replace('<!-- [[gen_import]] -->', im))
                            .pipe(replace('<!-- [[gen_route]] -->', el))
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



gulp.task('dialog', function () {
    return Promise.all([
        new Promise(function(resolve, reject) {
            glob("./src/routes/**/dialog-*.html", null, function (er, files) {

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
                        if($('dom-module').attr('id') == undefined){
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
                            if(value != undefined){
        
                                if(typeof value == "boolean"){
                                     if(value){
                                         return name
                                     }else{
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
        
                        elementList.map((row)=>{
                            im = im + `<link rel="lazy-import" href="${row.pathFile}">\n`
                            el = el + `<${row.elementName} ${addAttribute('label', row.topic)} path-file="${row.pathFile}" path="${row.pathRoute}" lazy></${row.elementName}>\n`
                           
                        })
        
        
                        gulp.src(['./src/nylon-init.html'])
                            .pipe(replace('<!-- [[gen_import_dialog]] -->', im))
                            .pipe(replace('<!-- [[gen_dialog]] -->', el))
                            .pipe(gulp.dest('./src/'))
                            .on('end', resolve)
                    }
                });
        
        
            })
        })
    ])

    

});


const myRename = function(source,destination){
    return new Promise(function(resolve, reject) {
        fs.rename(source, destination, function (err) {
            if (err) {
                throw err;
            }
            resolve();
        });
    })
}

gulp.task('rename:start', function () {

    return Promise.all([
        myRename('src/i18n', 'src/_i18n')
        ,
        myRename('src/redux', 'src/_redux')
        ,
        myRename('src/routes', 'src/_routes')
        ,
        myRename('files', '_files')
    ])

})

gulp.task('rename:end', function () {

    return Promise.all([
        myRename('src/_i18n', 'src/i18n')
        ,
        myRename('src/_redux', 'src/redux')
        ,
        myRename('src/_routes', 'src/routes')
        ,
        myRename('_files', 'files')
    ])

})

// const myCopy = function(source,destination){
//     return new Promise(function(resolve, reject) {
//         fs.rename(source, destination, function (err) {
//             if (err) {
//                 throw err;
//             }
//             resolve();
//         });
//     })
// }

gulp.task('copy', function (done) {
    return gulp.src(['../frontend/**/*']).pipe(gulp.dest('abc'));
})

gulp.task('del', function (done) {
    del(['abc']).then(paths => {
        done()
    });
})