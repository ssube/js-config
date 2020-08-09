import Ajv from 'ajv';
import { expect } from 'chai';

import { Config } from '../src/config';
import { InvalidDataError } from '../src/error/InvalidDataError';

describe('collected config', () => {
  it('should load data from each source', () => {
    const schema = new Ajv();
    schema.addSchema({}, 'foo');

    const config = new Config({
      key: 'foo',
      schema,
      sources: [{
        data: {
          bar: 1,
        },
        key: 'foo',
        type: 'const',
      }, {
        data: {
          foo: 2,
        },
        key: 'foo',
        type: 'const',
      }],
    });

    expect(config.getData()).to.deep.equal({
      bar: 1,
      foo: 2,
      zin: 3,
    });
  });

  it('should validate data after loading', () => {
    const schema = new Ajv();
    schema.addSchema({
      type: 'number',
    }, 'foo');

    expect(() => new Config({
      key: 'foo',
      schema,
      sources: [{
        data: {
          bar: 'not a number',
        },
        key: 'foo',
        type: 'const',
      }],
    })).to.throw(InvalidDataError);
  });

  it('should merge data from sources in order');
});
