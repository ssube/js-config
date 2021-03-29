import { InvalidArgumentError, NotFoundError } from '@apextoaster/js-utils';
import { createSchema, IncludeOptions } from '@apextoaster/js-yaml-schema';
import { expect } from 'chai';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SCHEMA } from 'js-yaml';
import { join } from 'path';
import { stub } from 'sinon';

import { loadFile, readFile } from '../src/file';

const TEST_OPTIONS: IncludeOptions = {
  exists: existsSync,
  join,
  read: readFileSync,
  resolve: realpathSync,
  schema: DEFAULT_SCHEMA,
};

describe('file source', async () => {
  describe('load file', async () => {
    it('should load an existing file', () => {
      const include = {
        ...TEST_OPTIONS,
      };
      const schema = createSchema({
        include,
      });
      include.schema = schema;

      expect(loadFile({
        include,
        name: 'config-stderr.yml',
        paths: [
          join(__dirname, '..', 'docs'),
        ],
        type: 'file',
      })).to.deep.include({
        data: {
          logger: {
            level: 'debug',
            name: 'salty-dog',
            stream: process.stderr,
          },
        },
      });
    });

    it('should throw when file is missing', () => {
      const include = {
        ...TEST_OPTIONS,
      };
      const schema = createSchema({
        include,
      });
      include.schema = schema;

      expect(() => loadFile({
        include,
        name: 'missing.yml',
        paths: [
          join(__dirname, '..', 'docs'),
        ],
        type: 'file',
      })).to.throw(NotFoundError);
    });

    it('should load included files', () => {
      const include = {
        ...TEST_OPTIONS,
      };
      const schema = createSchema({
        include,
      });
      include.schema = schema;

      expect(loadFile({
        include,
        name: 'config-include.yml',
        paths: [
          join(__dirname, '..', 'docs'),
        ],
        type: 'file',
      })).to.deep.include({
        data: {
          include: {
            foo: 'bar',
          },
        },
      });
    });
  });

  describe('read file', async () => {
    it('should consume enoent errors', () => {
      const include = {
        ...TEST_OPTIONS,
      };
      const schema = createSchema({
        include,
      });
      include.schema = schema;

      expect(readFile({
        include,
        name: 'missing.yml',
        paths: [
          'docs',
        ],
        type: 'file',
      })).to.equal(undefined);
    });

    it('should rethrow unknown errors', () => {
      const include = {
        ...TEST_OPTIONS,
        read: stub().throws(new InvalidArgumentError()),
      };
      const schema = createSchema({
        include,
      });
      include.schema = schema;

      expect(() => readFile({
        include,
        name: '.fake',
        paths: ['/C:/never/really/exists'],
        type: 'file',
      })).to.throw(Error);
    });
  });
});
