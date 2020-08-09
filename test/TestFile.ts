import { NotFoundError } from '@apextoaster/js-utils';
import { includeOptions } from '@apextoaster/js-yaml-schema';
import { expect } from 'chai';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { join } from 'path';

import { loadFile, readFile } from '../src/file';

const originalOptions = {
  ...includeOptions,
};

function fsOptions() {
  includeOptions.exists = existsSync;
  includeOptions.join = join;
  /* eslint-disable-next-line */
  includeOptions.read = readFileSync as any;
  includeOptions.resolve = realpathSync;
}

describe('load config helper', async () => {
  beforeEach(() => {
    fsOptions();
  });

  afterEach(() => {
    Object.assign(includeOptions, originalOptions);
  });

  it('should load an existing config', () =>
    expect(loadFile({
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
    })
  );

  it('should throw when config is missing', () =>
    expect(loadFile({
      key: '',
      name: 'missing.yml',
      paths: [
        join(__dirname, '..', 'docs'),
      ],
      type: 'file',
    })).to.be.rejectedWith(NotFoundError)
  );

  it('should load included config', () =>
    expect(loadFile({
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
    })
  );
});

describe('read config helper', async () => {
  beforeEach(() => {
    fsOptions();
  });

  afterEach(() => {
    Object.assign(includeOptions, originalOptions);
  });

  it('should consume enoent errors', () =>
    expect(readFile(join('docs', 'missing.yml'))).to.equal(undefined)
  );

  it('should rethrow unknown errors', () =>
    expect(() => readFile('test')).to.throw(Error)
  );
});
