import { NotFoundError } from '@apextoaster/js-utils';
import { createSchema, IncludeOptions } from '@apextoaster/js-yaml-schema';
import { expect } from 'chai';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SAFE_SCHEMA } from 'js-yaml';
import { join } from 'path';

import { loadFile, readFile } from '../src/file';

const TEST_OPTIONS: IncludeOptions = {
  exists: existsSync,
  join,
  read: readFileSync,
  resolve: realpathSync,
  schema: DEFAULT_SAFE_SCHEMA,
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

      expect(loadFile({
        include,
        key: '',
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

      expect(() => loadFile({
        include,
        key: '',
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

      expect(loadFile({
        include,
        key: '',
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

      expect(readFile({
        include,
        key: '',
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
      };
      const schema = createSchema({
        include,
      });

      expect(() => readFile({
        include,
        key: '',
        name: 'test',
        paths: [],
        type: 'file',
      })).to.throw(Error);
    });
  });
});
