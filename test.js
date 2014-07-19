/*!
 * namespace-data <https://github.com/jonschlinkert/namespace-data>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var namespace = require('./');
var pkg = require('./package');


describe('namespace()', function () {
  it('should namespace the data in the specified file.', function () {
    var actual = namespace(':basename', 'package.json');
    actual.should.have.property('package');
    actual.package.should.have.property('name', 'namespace-data');
  });

  it('should namespace data from an array of files using `:propstring`.', function () {
    var actual = namespace(':basename', ['fixtures/*.json']);
    actual.should.have.property('a');
    actual.should.have.property('b');
    actual.should.have.property('c');
  });

  it('should namespace data from an array of files using `:propstring`.', function () {
    var actual = namespace(':extname', ['fixtures/*.json']);
    actual.should.have.property('.json');
  });

  it('should namespace data from an array of files using `:propstring`.', function () {
    var actual = namespace(':ext', ['fixtures/*.json']);
    actual.should.have.property('json');
  });

  it('should namespace data from an array of files using `{propstring}`.', function () {
    var actual = namespace('{basename}', ['fixtures/*.json']);
    actual.should.have.property('a');
    actual.should.have.property('b');
    actual.should.have.property('c');
  });

  it('should namespace data from an array of files onto the `site` object.', function () {
    var actual = namespace('site', ['fixtures/*.json']);
    actual.should.have.property('site');
    actual.site.should.have.property('foo');
    actual.site.should.have.property('bar');
    actual.site.should.have.property('baz');
  });

  describe('when a single argument is passed:', function () {
    it('should namespace data using the basename of each file.', function () {
      var actual = namespace(['fixtures/*.json']);
      actual.should.have.property('a');
      actual.should.have.property('b');
      actual.should.have.property('c');
    });
  });
});