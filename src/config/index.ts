import { doesExist, InvalidArgumentError, isNil, NotFoundError } from '@apextoaster/js-utils';
import { CONFIG_SCHEMA, includeSchema } from '@apextoaster/js-yaml-schema';
import { safeLoad } from 'js-yaml';

import { completePaths } from '../utils';

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function loadConfig<T extends object>(name: string, ...extras: Array<string>): T {
  const paths = completePaths(name, extras);

  for (const p of paths) {
    const data = readConfig(p);
    if (doesExist(data)) {
      const config = safeLoad(data, {
        schema: CONFIG_SCHEMA,
      });

      if (isNil(config) || typeof config !== 'object') {
        throw new InvalidArgumentError('loaded config was not an object');
      }

      return config as T;
    }
  }

  throw new NotFoundError('unable to load config');
}

export function readConfig(path: string): string | undefined {
  try {
    // need to await this read to catch the error, need to catch the error to check the code
    /* eslint-disable-next-line sonarjs/prefer-immediate-return */
    const data = includeSchema.read(path, {
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
