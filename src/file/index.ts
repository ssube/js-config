import { doesExist, NotFoundError } from '@apextoaster/js-utils';
import { CONFIG_SCHEMA, includeOptions } from '@apextoaster/js-yaml-schema';

import { BaseSourceOptions } from '../config';
import { loadObject } from '../utils';

export interface FileSourceOptions extends BaseSourceOptions {
  key: string;
  name: string;
  paths: Array<string>;
  type: 'file';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadFile(options: FileSourceOptions): any {
  const paths = completePaths(options.name, options.paths);

  for (const p of paths) {
    const data = readFile(p);
    if (doesExist(data)) {
      return loadObject(data, CONFIG_SCHEMA);
    }
  }

  throw new NotFoundError('unable to load config');
}

export function readFile(path: string): string | undefined {
  // need to call this read to catch the error, need to catch the error to check the code
  try {
    /* eslint-disable-next-line sonarjs/prefer-immediate-return */
    const data = includeOptions.read(path, {
      encoding: 'utf-8',
    });
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return undefined;
    }
    throw err;
  }
}

/**
 * With the given name, generate all potential config paths in their complete, absolute form.
 *
 * This will include the value of `ISOLEX_HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, extras: Array<string>): Array<string> {
  const paths = [];

  const home = process.env.HOME;
  if (typeof home === 'string' && home !== '') {
    paths.push(includeOptions.join(home, name));
  }

  if (__dirname !== '') {
    paths.push(includeOptions.join(__dirname, name));
  }

  for (const e of extras) {
    paths.push(includeOptions.join(e, name));
  }

  return paths;
}
