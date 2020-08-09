import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { safeLoad, Schema } from 'js-yaml';

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
