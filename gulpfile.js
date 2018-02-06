const gulp = require('gulp')
const glob = require("glob")
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const async = require('async')
const fs = require('fs')
const cheerio = require('cheerio')

gulp.task('route2', function () {

    glob("./src/routes/**/route-*.html", null, function (er, files) {

        const addAttribute = (name, value) => {
            if (value) {
                return `${name}="${value}"`
            }
            return ""
        }

        let el = ''
        let im = ''
        // let root = []

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

                pathRoute = domModule.attr('path') || pathRoute
                let topic = domModule.attr('topic')

                const rule = function () {
                    if (domModule.attr('rule') != undefined) {
                        return 'rule'
                    } else {
                        return ''
                    }
                }

                im = im + `<link rel="lazy-import" href="${pathFile}">\n`
                el = el + `<${elementName} ${addAttribute('topic', topic)} path-file="${pathFile}" path="${pathRoute}" ${rule()}></${elementName}>\n`

                // root.push({
                //     name: elementName,
                //     topic
                // })

                callback();
            });

        }, function (err) {
            if (err) {
                console.log('error: ' + err);
            } else {
                gulp.src(['./src/nylon-init-template.html'])
                    .pipe(replace('<!-- [[gen_import]] -->', im))
                    .pipe(replace('<!-- [[gen_route]] -->', el))
                    .pipe(rename('nylon-init.html'))
                    .pipe(gulp.dest('./src/'))

                //console.log(el)
                console.log('**************')
                console.log('successfully')
            }
        });







        // gulp.src(['./src/nylon-init-template.html'])
        // .pipe(replace('<!-- [[gen_import]] -->', im))
        // .pipe(replace('<!-- [[gen_route]] -->', el))
        // .pipe(rename('nylon-init.html'))
        // .pipe(gulp.dest('./src/'))

        //console.log(el)


    })

});



gulp.task('route', function () {

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
                        elementNameCut = elementName.split('>')[0]
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

                        eln = elementList.filter((row2)=>{
                            return row2.elementName == row
                        })[0]

                        return {
                            elementName: row,
                            url: eln.pathRoute,
                            label: eln.topic
                        }
                    })
                })

                //console.log(nav)

                gulp.src(['./src/nylon-init-template.html'])
                    .pipe(replace('<!-- [[gen_import]] -->', im))
                    .pipe(replace('<!-- [[gen_route]] -->', el))
                    .pipe(replace('gen_navigation', JSON.stringify(nav)))
                    .pipe(rename('nylon-init.html'))
                    .pipe(gulp.dest('./src/'))

                console.log('**************')
                console.log('successfully')
            }
        });







        // gulp.src(['./src/nylon-init-template.html'])
        // .pipe(replace('<!-- [[gen_import]] -->', im))
        // .pipe(replace('<!-- [[gen_route]] -->', el))
        // .pipe(rename('nylon-init.html'))
        // .pipe(gulp.dest('./src/'))

        //console.log(el)


    })

});





gulp.task('test', function () {
    let list = [
        { name: 'A' },
        { name: 'B', parent: 'A' },
        { name: 'C', parent: 'B' },
        { name: 'D', parent: 'C' },
        { name: 'E', parent: 'D' },
        { name: 'F', parent: 'E' }
    ]

    let data = list.filter((row) => {
        return row.parent == undefined
    })

    const getRoot = function (list, data) {
        let root = data.map(function (row, i) {
            let child = list.filter(function (row2) {
                return row2.parent == row.name
            })

            if (child.length > 0) {
                row.child = getRoot(list, child)
            }
            return row
        })

        return root
    }


    console.log(getRoot(list, data)[0].child[0])


});



gulp.task('test2', function () {
    let list = [
        { name: 'A' },
        { name: 'B', parent: 'A' },
        { name: 'C', parent: 'B' },
        { name: 'D', parent: 'C' },
        { name: 'E', parent: 'D' },
        { name: 'F', parent: 'E' }
    ]

    const navigate = (page) => {
        pageCut = page.split('>')[0]
        let getPage = list.filter((row) => {
            return row.name == pageCut
        })

        if (getPage.length != 0) {
            if (getPage[0].parent) {
                return navigate(getPage[0].parent + '>' + page)
            }
        }

        return page
    }

    console.log(navigate('D').split('>'))


});