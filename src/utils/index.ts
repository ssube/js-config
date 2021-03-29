import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { load, Schema } from 'js-yaml';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadObject(data: string, schema: Schema): any {
  const val = load(data, {
    schema,
  });

  if (isNil(val) || typeof val !== 'object') {
    throw new InvalidArgumentError('loaded config was not an object');
  }

  return val;
}
