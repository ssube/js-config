import { doesExist, NotFoundError } from '@apextoaster/js-utils';
import { CONFIG_SCHEMA, includeOptions } from '@apextoaster/js-yaml-schema';

import { completePaths, loadObject } from '../utils';

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function loadConfig<T extends object>(name: string, ...extras: Array<string>): T {
  const paths = completePaths(name, extras);

  for (const p of paths) {
    const data = readConfig(p);
    if (doesExist(data)) {
      return loadObject(data, CONFIG_SCHEMA);
    }
  }

  throw new NotFoundError('unable to load config');
}

export function readConfig(path: string): string | undefined {
  try {
    // need to await this read to catch the error, need to catch the error to check the code
    /* eslint-disable-next-line sonarjs/prefer-immediate-return */
    const data = includeOptions.read(path, {
      encoding: 'utf-8',
    });
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}
