module.exports = function(params, callback) {
  'use strict';

  var assemble = params.assemble;
  var grunt    = params.grunt;
  var options  = assemble.options;
  var pages    = options.pages;

  var langs    = Object.keys(options.pkg.languages);

  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var dest = page.dest.replace(/^site/, '');
    for (var j = 0; j < langs.length; j++) {
      grunt.file.copy(page.dest, 'site/lang/' + langs[j] + dest);
    }
  }

  callback();
};

module.exports.options = {
  stage: 'render:post:pages'
};
