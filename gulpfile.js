const gulp = require('gulp')
const glob = require("glob")
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const async = require('async')
const fs = require('fs')
const cheerio = require('cheerio')

gulp.task('route', function(){

    glob("./src/routes/**/route-*.html", null, function (er, files) {

        const addAttribute = (name,value) => {
            if(value){
                return `${name}="${value}"`
            }
            return ""
        }

        let el = ''
        let im = ''

        async.each(files, (file, callback) => {

            console.log('Processing file : ' + file)

            let splitSlash = file.split('/')
            let fileName = splitSlash[splitSlash.length-1]
            let elementName = fileName.split('.')[0]
            let pathRoute = '/' + elementName.split('route-')[1].replace('-','/')
            let pathFile = file.split('./src/')[1]

            

            fs.readFile(file, "utf8", (err, data) => {
                if (err) {
                    callback(err)
                }
                const $ = cheerio.load(data)

                pathRoute = $('dom-module').attr('path') || pathRoute
                let topic = $('dom-module').attr('topic') 
             
                

                im = im + `<link rel="lazy-import" href="${pathFile}">\n`
                el = el + `<${elementName} ${addAttribute('topic',topic)} path-file="${pathFile}" path="${pathRoute}"></${elementName}>\n`

                callback();
            });

        }, function(err) {
            if( err ) {
                console.log('error: '+ err);
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



gulp.task('route_bak2', function(){

    glob("./src/routes/**/route-*.html", null, function (er, files) {
  

        let el = ''
        let im = ''

        files.map((file)=>{
            
            var splitSlash = file.split('/')
            var fileName = splitSlash[splitSlash.length-1]
            var elementName = fileName.split('.')[0]
            var pathRoute = '/' + elementName.split('route-')[1].replace('-','/')
            var pathFile = file.split('./src/')[1]

            im = im + `<link rel="lazy-import" href="${pathFile}">\n`
            el = el + `<${elementName} path-file="${pathFile}" path="${pathRoute}"></${elementName}>\n`

        })
        

        gulp.src(['./src/nylon-init-template.html'])
        .pipe(replace('<!-- [[gen_import]] -->', im))
        .pipe(replace('<!-- [[gen_route]] -->', el))
        .pipe(rename('nylon-init.html'))
        .pipe(gulp.dest('./src/'))

        console.log(el)

        
    })
    
  });





gulp.task('route_bak', function(){

    glob("./src/route/**/*-route.html", null, function (er, files) {
        const snakeToCamel = function(s){
            return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
        }

        var pageList = files.map(function(file){
            var fileSplit1 = file.split('/')
            var fileName = fileSplit1[fileSplit1.length-1]

            var elementName = fileName.split('-route.html')[0]

            var pathSplit1 = file.split('/'+fileName)
            var pathSplit2 = pathSplit1[0]
            var pathSplit3 = pathSplit2.split('./src/route/')[1]
            var pathSplit4 = elementName.split('page-')[1]
            
            
            var pathName = '';
            if(pathSplit4 == pathSplit3.replace('/','-')){
                pathName = pathSplit3
            }else{
                pathName = pathSplit3+'/'+pathSplit4.split(pathSplit3.replace('/','-'))[1].replace('-','')
            }
            pathName = '/'+pathName

            return {
                file: fileName,
                el: elementName,
                path: pathName,
                pathFile: pathSplit3
            }
        })

        var el = ''
        var im = ''

        pageList.map((row)=>{
            var pathFile = `./route/${row.pathFile}/${row.el}-route.html`
            im = im + `<link rel="lazy-import" href="${pathFile}">\n`
            el = el + `<${row.el} path-file="${pathFile}" path="${row.path}"></${row.el}>\n`
        })

        //console.log(el)

        gulp.src(['./src/nylon-init-template.html'])
        .pipe(replace('<!-- [[gen_import]] -->', im))
        .pipe(replace('<!-- [[gen_route]] -->', el))
        .pipe(rename('nylon-init.html'))
        .pipe(gulp.dest('./src/'))

        console.log(el)

        
    })
    
  });
