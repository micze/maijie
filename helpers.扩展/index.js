var path = require('path');
var fs = require('fs');

module.exports.register = function(Handlebars, options) {
  Handlebars.registerHelper('obj_val', function(object, property) {
    return object ? object[property] : property;
  });

  Handlebars.registerHelper('find_and_include', function(filename) {
    var dir, file = '', filepath;
    dir = path.dirname(this.page.src);
    filepath = path.join(dir, filename);
    if (fs.existsSync(filepath)) {
      file = fs.readFileSync(filepath);
    } else {
      filepath = path.join(path.dirname(dir), filename);
      if (fs.existsSync(filepath)) {
        file = fs.readFileSync(filepath);
      }
    }
    return file;
  });
};
