const Handlebars = require("handlebars");

module.exports.registerHelpers = function() {
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper('ifOr', function(arg1, arg2, options) {
    return (arg1 || arg2) ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper('ifOr3', function(arg1, arg2, arg3, options) {
    return (arg1 || arg2 || arg3) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('lang', function(arg1, options) {
    const argC = arg1.toLowerCase() === 'ua' ? 'uk' : arg1.toLowerCase();
    return (argC == (this.this?.lang || this.lang)) ? options.fn(this) : (!!options?.inverse ? options.inverse(this) : "");
  });

  Handlebars.registerHelper('translate', function(value, options) {
    if (!value) return value; // If value is empty, return it as is
    switch (this.lang) {
      case 'uk': return value
                          .replace('km', 'км')
                          .replace('Stunden', 'годин')
                          .replace('Einfach', 'легкий')
                          .replace('Mittel', 'середній')
                          .replace('Schwer', 'важкий')
                          ;
      case 'en':
      default:
        return value;
    }
  });
  

  Handlebars.registerHelper('link', function(url, options) {
    const l = !!options.hash.lang ? options.hash.lang : this.lang;
    const root = l === 'en' ? this.context.root : this.context.root + l + "\\";
    return root + url;
  });

  Handlebars.registerHelper('json', function(context) {
    return JSON.parse(context);
  });

  Handlebars.registerHelper('setVar', function(varName, varValue, options) {
    options.data.root[varName] = varValue;
  });
  
  Handlebars.registerHelper('addDays', function(day, delta, options) {
    const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const i = days.indexOf(day);
    return days[(i + delta) % 7];
  });

  Handlebars.registerHelper('getTripsByNames', function(tripNames, options) {
    return tripNames.map(name => {
      return options.data.root.global.listings[name];
    });
  });

  /*
    * Repeat given markup with given times
    * provides @index for the repeated iteraction
  */
  Handlebars.registerHelper("repeat", function (times, opts) {
    var out = "";
    var i;
    var data = {};

    if ( times ) {
        for ( i = 0; i < times; i += 1 ) {
            data.index = i;
            out += opts.fn(this, {
                data: data
            });
        }
    } else {

        out = opts.inverse(this);
    }

    return out;
  });

  Handlebars.registerHelper('letter', function(index) {
    const i = parseInt(index, 10);
    return String.fromCharCode(65 + (i % 26));
  });

  Handlebars.registerHelper('concat', (...args) => {
    // the last argument is Handlebars options object
    args.pop();
    return args.join('');
  });
}
