import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { includeOptions } from '@apextoaster/js-yaml-schema';
import { safeLoad, Schema } from 'js-yaml';

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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadObject(data: string, schema: Schema): any {
  const val = safeLoad(data, {
    schema,
  });

  if (isNil(val) || typeof val !== 'object') {
    throw new InvalidArgumentError('loaded config was not an object');
  }

  return val;
}
