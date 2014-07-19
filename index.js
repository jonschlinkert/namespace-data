/*!
 * namespace-data <https://github.com/jonschlinkert/namespace-data>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';


var arrayify = require('arrayify-compact');
var parsePath = require('parse-filepath');
var replacements = require('replacements');
var readData = require('read-data');
var glob = require('globby');
var _ = require('lodash');


/**
 * ```js
 * namespace(':propstring', [glob], {context: {}});
 * ```
 *   - `:propstring` A variable, like a template, which will be replaced with the
 *     value of any matching property on the context. You can use any prop strings that
 *     match properties on the context. The default context consists of all the method
 *     names from the [node.js path module][node.js], (e.g. `:basename`, `:extname`, etc.)
 *   - `glob`: File path, paths or glob patterns for data files to read.
 *   - `context`: Extend the context to enable additional values to be used as propstrings.
 *
 * Read data files and extend the data from each onto an object or objects named using
 * the given string or propstring.
 *
 * ### Examples
 *
 * Given you have two JSON files, `a.json` and `b.json`, with the following contents:
 *
 * ```json
 * // a.json
 * {
 *   "foo": "I'm a.json!"
 * }
 *
 * // b.json
 * {
 *   "bar": "I'm b.json!"
 * }
 * ```
 *
 * **propstrings**
 *
 * You can namespace the data from each file onto an object where the object name is
 * dynamically generated using `:propstrings`.
 *
 * ```js
 * data.namespace(':basename', ['a.json', 'b.json']);
 * //=> '{ "a": {"foo": "I'm a.json!"}, "b": {"bar": "I'm b.json!"} }'
 *
 * // if a single argument is passed, `basename` is used by default, so this:
 * data.namespace(['a.json', 'b.json']);
 * // also results in '{ "a": {"foo": "I'm a.json!"}, "b": {"bar": "I'm b.json!"} }'
 * ```
 *
 * Same data but namespaced using `:ext` (file extension) instead:
 *
 * ```js
 * data.namespace(':ext', ['a.json', 'b.json']);
 * { "json": {"foo": "I'm a.json!", "bar": "I'm b.json!"} }
 * ```
 *
 *
 * [node.js]: http://nodejs.org/api/path.html
 *
 * @param {*} `patterns` Filepaths or glob patterns.
 * @return {null}
 * @api public
 */

module.exports = function namespace(namespace, patterns, context) {
  var arity = arguments.length;

  context = context || {};
  var propstring = false;
  var obj = {}, non = {};

  if (arity === 1) {
    patterns = namespace;
    namespace = ':basename';
  }

  glob.sync(arrayify(patterns)).forEach(function(filepath) {
    var data = readData.readYAMLSync(filepath);
    var parsed = parsePath(filepath);

    // store a reference to `name` in case it gets overwritten
    // in the context
    parsed.basename = parsed.name;
    parsed.ext = parsed.extname.replace(/\./, '');

    var ctx = _.extend({}, parsed, context);
    var name = namespace;

    if (/:|\{/.test(namespace)) {
      propstring = true;
      var name = replacements(namespace, [
        {
          pattern: /:([\w-]+)/g,
          replacement: function(match, prop) {
            return ctx[prop] || prop;
          }
        },
        {
          pattern: /\{([^}]+)}/g,
          replacement: function(match, prop) {
            return ctx[prop] || prop;
          }
        }
      ], ctx);
      obj[name] = data;
    } else {
      _.extend(obj, data);
    }
  });

  if (!propstring) {
    non[namespace] = obj;
    return non;
  }
  return obj;
};