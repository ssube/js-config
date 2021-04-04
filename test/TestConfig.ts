import { IncludeOptions } from '@apextoaster/js-yaml-schema';
import Ajv from 'ajv';
import { expect } from 'chai';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SCHEMA } from 'js-yaml';
import { ConsoleLogger } from 'noicejs';
import { join } from 'path';

import { Config, createConfig } from '../src/config';
import { InvalidDataError } from '../src/error/InvalidDataError';

export const INCLUDE_OPTIONS: IncludeOptions = {
  exists: existsSync,
  join,
  read: readFileSync,
  resolve: realpathSync,
  schema: DEFAULT_SCHEMA,
};

describe('collected config', () => {
  it('should load data from each source', () => {
    const validator = new Ajv();
    validator.addSchema({}, 'foo');

    const config = new Config<{
      bar: number;
      foo: number;
    }>({
      include: INCLUDE_OPTIONS,
      key: 'foo',
      sources: [{
        data: {
          bar: 1,
        },
        type: 'const',
      }, {
        data: {
          foo: 2,
        },
        type: 'const',
      }],
      validator,
    });

    expect(config.getData()).to.deep.equal({
      bar: 1,
      foo: 2,
    });
  });

  it('should validate data after loading', () => {
    const validator = new Ajv();
    validator.addSchema({
      type: 'number',
    }, 'foo');

    expect(() => new Config({
      include: INCLUDE_OPTIONS,
      key: 'foo',
      sources: [{
        data: {
          bar: 'not a number',
        },
        type: 'const',
      }],
      validator,
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
        config: {
          key: '',
          sources: [{
            data: {
              foo: 3,
            },
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
          include: INCLUDE_OPTIONS,
        },
      });

      expect(config.getData()).to.deep.equal({
        foo: 3,
      });
    });

    it('should set up extended schema', () => {
      const config = createConfig<{
        data: {
          foo: string;
          stream: unknown;
        };
      }>({
        config: {
          key: '',
          sources: [{
            name: 'config-stream.yml',
            paths: [
              join(__dirname, '..', 'docs'),
            ],
            type: 'file',
          }],
        },
        process,
        schema: {
          include: INCLUDE_OPTIONS,
        },
      });

      const {data} = config.getData();
      expect(data.foo).to.equal('bar');
      expect(data.stream).to.equal(process.stdout);
    });
  });
});
