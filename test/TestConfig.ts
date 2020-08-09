import { IncludeOptions } from '@apextoaster/js-yaml-schema';
import Ajv from 'ajv';
import { expect } from 'chai';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SAFE_SCHEMA } from 'js-yaml';
import { join } from 'path';

import { Config, createConfig } from '../src/config';
import { InvalidDataError } from '../src/error/InvalidDataError';

export const INCLUDE_OPTIONS: IncludeOptions = {
  exists: existsSync,
  join,
  read: readFileSync,
  resolve: realpathSync,
  schema: DEFAULT_SAFE_SCHEMA,
};

describe('collected config', () => {
  it('should load data from each source', () => {
    const schema = new Ajv();
    schema.addSchema({}, 'foo');

    const config = new Config<{
      bar: number;
      foo: number;
    }>({
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

  describe('create helper', () => {
    it('should load everything', () => {
      const config = createConfig<{
        bar: string;
        bin: string;
        foo: number;
      }>({
        ajv: {},
        config: {
          key: '',
          sources: [{
            data: {
              foo: 3,
            },
            key: '',
            type: 'const',
          }],
        },
        defer: {
          home: 'bar',
          name: 'bar',
          paths: 'bin',
        },
        process,
        schema: {
          include: {...INCLUDE_OPTIONS},
        },
      });

      expect(config.getData()).to.deep.equal({
        foo: 3,
      });
    });
  });
});
