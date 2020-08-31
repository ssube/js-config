import { doesExist, NotFoundError } from '@apextoaster/js-utils';
import { IncludeOptions } from '@apextoaster/js-yaml-schema';

import { BaseSourceOptions, deferConfig } from '../config';
import { loadObject } from '../utils';

export interface FileSourceOptions extends BaseSourceOptions {
  include: IncludeOptions;
  name: string;
  paths: Array<string>;
  type: 'file';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadFile(options: FileSourceOptions): any {
  const data = readFile(options);

  if (doesExist(data)) {
    return loadObject(data, options.include.schema);
  }

  throw new NotFoundError('unable to load config');
}

export function readFile(options: FileSourceOptions): string | undefined {
  const paths = completePaths(options.name, options.paths, options.include);

  for (const p of paths) {
    // need to call this read to catch the error, need to catch the error to check the code
    try {
      /* eslint-disable-next-line sonarjs/prefer-immediate-return */
      const data = options.include.read(p, {
        encoding: 'utf-8',
      });

      return data;
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
        case 'EISDIR':
          continue;
        default:
          throw err;
      }
    }
  }

  return undefined;
}

/**
 * With the given name, generate all potential config paths in their complete, absolute form.
 *
 * This will include the value of `ISOLEX_HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, basePaths: Array<string>, options: IncludeOptions): Array<string> {
  const paths = [];

  const home = process.env.HOME;
  if (typeof home === 'string' && home !== '') {
    paths.push(options.join(home, name));
  }

  if (__dirname !== '') {
    paths.push(options.join(__dirname, name));
  }

  for (const p of basePaths) {
    paths.push(options.join(p, name));
  }

  return paths;
}
