'use strict';

const chai = require('chai');

const should = chai.should();

describe('intersect', () => {
  const intersect = require('../lib/intersect');

  it('basic usage', () => {
    intersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1').should.equal('^2.2.0');

    should.not.exist(intersect('~2.2.4', '~2.3.0'));
    intersect('~2.2.4', '~2.2.5').should.equal('~2.2.5');
    intersect('^2.2.4', '~2.2.5').should.equal('~2.2.5');

    intersect('^2.2.4', '^2.3.5').should.equal('^2.3.5');

    intersect('>=6.0.0', '>=7.0.0').should.equal('>=7.0.0');
    should.not.exist(intersect('>=6.0.0', '<6.0.0'));
  });
});
