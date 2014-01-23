module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 3000,
          base: 'site'
        }
      }
    },
    open: {
      dev: {
        path: 'http://localhost:3000/'
      }
    },
    clean: {
      css: [ 'site/assets/css/*.css' ],
      js: [ 'site/assets/js/*.js' ],
      images: [ 'site/assets/images/**' ],
      lang: [ 'site/lang' ],
      site: [ 'site/*', '!site/lang' ],
      tmp: [ 'tmp/*' ]
    },
    copy: {
      images: {
        expand: true,
        cwd: 'assets.资源/images/',
        src: '**',
        dest: 'site/assets/images/'
      },
      images2: {
        expand: true,
        cwd: 'images.图片/',
        src: '**',
        dest: 'site/images/'
      },
      static: {
        expand: true,
        cwd: 'static.静态/',
        src: '**',
        dest: 'site/',
        dot: true
      }
    },
    less: {
      options: {
        compress: true,
        stripBanners: true,
        banner: '/*! Generated on <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %> */\n'
      },
      styles: {
        files: {
          'site/assets/css/application.css': [ 'assets.资源/css/index.less' ]
        }
      }
    },
    uglify: {
      javascripts: {
        files: [{
          expand: true,
          cwd: 'assets.资源/js/',
          src: [ '**/*.js', '!**/*.min.js' ],
          dest: 'tmp/js/'
        }]
      }
    },
    concat: {
      options: {
        banner: '/*! Generated on <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %> */\n'
      },
      js: {
        files: {
          'site/assets/js/application.js': [ 'assets.资源/js/**/jquery-*.min.js', 'assets.资源/js/**/*.min.js', 'tmp/js/**/*.js' ]
        }
      }
    },
    md5: {
      options: {
        afterEach: function(fileChanged) {
          grunt.file.delete(fileChanged.oldPath);
        },
        after: function(filesChanged) {
          var compiled_assets = grunt.config('assemble.options.compiled_assets') || {};
          for (var i = 0; i < filesChanged.length; i++) {
            compiled_assets[filesChanged[i].oldPath.replace(/^site/, '')] = filesChanged[i].newPath.replace(/^site/, '');
          }
          grunt.config('assemble.options.compiled_assets', compiled_assets);
        }
      },
      css: {
        files: {
          'site/assets/css/': [ 'site/assets/css/*.css' ]
        }
      },
      js: {
        files: {
          'site/assets/js/': [ 'site/assets/js/*.js' ]
        }
      }
    },
    assemble: {
      options: {
        pkg: '<%= pkg %>',
        plugins: [ 'assemble-permalink', 'plugins.插件/langcopy.js' ],
        helpers: [ 'handlebars-helper-prettify', 'helpers.扩展/*.js' ],
        partials: [ 'partials.模块/*.hbs' ],
        layoutdir: 'layouts.模板',
        layout: 'default.hbs',
        production: false
      },
      products: {
        options: {
          layout: 'product.hbs'
        },
        expand: true,
        cwd: 'products.产品/',
        src: [ '**/*.html' ],
        dest: 'site/products/',
        dest_for_permalink: 'site/'
      },
      static: {
        files: {
          'site/': [ 'pages.页面/*.hbs' ]
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      /* NOTE: DO NOT WATCH FILES IN WORKING DIRECTORY
       * It may be a bug that tasks watching files in working
       * directory will be executed when new directory creates,
       * though this directory is not in the task's files option.
       */
      css: {
        files: [ 'assets.资源/css/*.less' ],
        tasks: [ 'clean:css', 'less' ]
      },
      js: {
        files: [ 'assets.资源/js/*.js' ],
        tasks: [ 'clean:js', 'uglify', 'concat' ]
      },
      grunt: {
        files: [ 'Gruntfile.js' ]
      },
      reassemble: {
        files: [ 'helpers.扩展/*', 'layouts.模板/*', 'partials.模块/*', 'pages.页面/*' ],
        tasks: [ 'assemble' ]
      },
      products: {
        files: [ 'products.产品/**/*.html', 'products.产品/**/*.hbs' ],
        tasks: [ 'assemble:products' ]
      }
    }
  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('assemble-less');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-md5');

  grunt.registerTask('assemble_in_production', '', function() {
    grunt.config('assemble.options.production', true);
    var pkg = grunt.config('assemble.options.pkg');
    if (pkg.use_production_url) {
      pkg.url = pkg.production_url;
      grunt.config('assemble.options.pkg', pkg);
    }
    grunt.log.ok('Entered production mode.');
  });
  grunt.registerTask('common', [ 'clean:site', 'less', 'uglify', 'concat', 'clean:tmp', 'copy' ]);
  grunt.registerTask('default', [ 'common', 'assemble', 'connect', 'open', 'watch' ]);
  grunt.registerTask('make', [ 'common', 'md5', 'assemble_in_production', 'assemble' ]);

  grunt.registerTask('translate', [ 'clean:lang', '_translate' ]);
  grunt.registerTask('_translate', 'translate pages', function() {
    if (grunt.file.isDir('site/lang')) {
      grunt.fail.fatal('Please rm -rf site/lang first.');
    }
    var pkg = grunt.config('pkg');
    var langs = Object.keys(pkg.languages);
    var dest = 'site';
    var pages = grunt.file.expand({
      cwd: dest
    }, ['**/*.html']);
    var dirs = grunt.file.expand({
      cwd: dest,
      filter: 'isDirectory'
    }, ['*', '!assets', '!images']);
    function esc(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
    // prepare regexs
    var regexs = {};
    var dirregex = '"\/(' + dirs.join('|') + ')'
    for (var i = 0; i < langs.length; i++) {
      var l = langs[i];
      var yaml = grunt.file.readYAML('langs.语言/' + l + '.yml');
      regexs[l] = regexs[l] || {};
      for (y in yaml) {
        regexs[l][esc(y)] = yaml[y];
      }
      regexs[l][dirregex] = '"/lang/' + l + '/$1';
    }
    pages.forEach(function(page) {
      var content = grunt.file.read(dest + '/' + page);
      for (var i = 0; i < langs.length; i++) {
        var l = langs[i];
        var langpath = dest + '/lang/' + l + '/' + page;
        var new_content = content;
        for (regex in regexs[l]) {
          var r = new RegExp(regex, 'g');
          new_content = new_content.replace(r, regexs[l][regex]);
        }
        grunt.file.write(langpath, new_content);
      }
      grunt.log.ok(page + ' translated.');
    });
  });

  // grunt getlang:"/Users/x/micze.com"
  grunt.registerTask('getlang', '', function(dir) {
    var yaml = require('js-yaml');
    if (!dir) return grunt.fail.fatal('Please provide a dir.');
    var cheerio = require('cheerio');
    function read(file) {
      var $ = cheerio.load(grunt.file.read(dir + '/' + file));
      var text = $('.menulist').text() + $('.sidelist').text();
      text = text.replace(/[\t\r]*/g, '')
      text = text.replace('LED EVENT LIGHT', ''); // exceptions
      text = text.replace(/\n{1,}/g, '\n').trim();
      return text.split(/\s*\n\s*/);
    }
    var en = read('index.html');
    var obj = {};
    for (var i = 0; i < en.length; i++) {
      obj[en[i]] = en[i];
    }
    grunt.file.write('langs.语言/en.yml', yaml.dump(obj));
    var files = grunt.file.expand({
      cwd: dir
    }, ['lang/*/index.html']);
    files.forEach(function(file) {
      var l = file.split('/')[1];
      var lang = read(file);
      var obj = {};
      for (var i = 0; i < en.length; i++) {
        obj[en[i]] = lang[i];
      }
      grunt.file.write('langs.语言/' + l + '.yml', yaml.dump(obj));
    });
  });

  // grunt convert:"/Users/x/micze.com/products"
  grunt.registerTask('convert', '', function(dir) {
    if (!dir) return grunt.fail.fatal('Please provide a dir.');
    var cheerio = require('cheerio');
    var path = require('path');
    var files = grunt.file.expand({
      cwd: dir
    }, ['**/*.html']).filter(function(file) {
      return file.indexOf('/') > -1 && file.indexOf('list_') === -1;
    });
    var yaml = require('js-yaml');
    function get_title_keywords_and_description($, before) {
      var title = $('title').text().replace(/[\r\n]+?/g, ' ').trim();
      var desc = $('meta[name="description"]').attr('content').replace(/[\r\n]+?/g, ' ').trim();
      var keywords = $('meta[name="keywords"]').attr('content').replace(/[\r\n]+?/g, ' ').trim().split(/\s*,\s*/);
      title = yaml.dump({ title: title });
      desc = yaml.dump({ description: desc });
      keywords = yaml.dump({ keywords: keywords });
      return '---\n' + (before || '') + title + '\n' + desc + '\n' + keywords + '\n' + '---\n';
    }
    files.forEach(function(file) {
      var $ = cheerio.load(grunt.file.read(dir + '/' + file));
      if (file.indexOf('index.html') === -1) {
        var html = $.html('table[height]');
        html = html.replace(/\r\n/g, '\n');
        html = html.replace(/http:\/\/www\.micze\.com\/UploadFiles\//g, '/images/');
        html = html.replace(/\/UploadFiles\//g, '/images/');
        html = html.replace(/^\t{4}/mg, '');
        html = html.replace(/^\t{1,}/mg, '  ');
        html = html.trim() + '\n';
        html = get_title_keywords_and_description($) + html;
        grunt.file.write('products.产品/' + file, html);
      } else {
        if ($('#image1').length > 0 && file.match(/\//g).length > 1) {
          var html = $.html($('#image1').closest('tr'));
          html = html.replace(/\r\n/g, '\n');
          html = html.replace(/http:\/\/www\.micze\.com\/UploadFiles\//g, '/images/');
          html = html.replace(/\/UploadFiles\//g, '/images/');
          html = html.replace(/"> </g, '">\n<');
          html = html.replace(/\t/g, '').trim() + '\n';
          var slide = path.join('products.产品', path.dirname(file), 'slide.hbs');
          grunt.file.write(slide, html);
          slide = path.join('products.产品', path.dirname(path.dirname(file)), 'slide.hbs');
          grunt.file.write(slide, html);
        }
        if ($('.nav').length > 0 && file.match(/\//g).length > 1) {
          var html = $.html($('.nav').closest('tr'));
          html = html.replace(/\r\n/g, '\n');
          html = html.replace(/\n{2,}/g, '\n');
          html = html.replace(/\s?<a/g, '\n<a');
          html = html.replace(/a>\s?\|/g, 'a>\n|');
          html = html.replace(/\t/g, '').trim() + '\n';
          var header = path.join('products.产品', path.dirname(file), 'header.hbs');
          grunt.file.write(header, html);
        }
        var htmlfiles = grunt.file.expand({
          cwd: path.join(dir, path.dirname(file))
        }, ['**/*.html']).filter(function(filename) {
          return (filename.indexOf('index.html') === -1 && filename.indexOf('list_') === -1);
        });
        if (htmlfiles.length === 0) grunt.fail.fatal('no html files found!!');
        var first_file = htmlfiles[0];
        if (file.match(/\//g).length === 1) {
          var index = 
            get_title_keywords_and_description($, 'layout: default.hbs\n\n') +
            '<div class="box_main" id="box_main">' + '\n' +
            '  <table border="0" cellspacing="0" cellpadding="0" width="620">' + '\n' +
            '{{{find_and_include "slide.hbs"}}}' + '\n' +
            '{{{list_all_headers}}}' + '\n' +
            '    <tr><td>' + '\n' +
            '{{{find_and_include "' + first_file + '"}}}' + '\n' +
            '    </td></tr>' + '\n' +
            '  </table>' + '\n' +
            '</div>' + '\n';
          var indexfile = path.join('products.产品', path.dirname(file), 'index.html');
          grunt.file.write(indexfile, index);
        } else {
          var index = 
            get_title_keywords_and_description($, 'layout: product.hbs\n\n') +
            '{{{include_this_or_the_first_html_file "' + first_file + '"}}}' + '\n';
          var indexfile = path.join('products.产品', path.dirname(file), 'index.html');
          grunt.file.write(indexfile, index);
        }
      }
    });
  })
};
