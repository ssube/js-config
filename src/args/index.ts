import { Optional } from '@apextoaster/js-utils';

import { BaseSourceOptions } from '../config';

export interface ArgSourceOptions extends BaseSourceOptions {
  parser: unknown;
  process: Optional<NodeJS.Process>;
  type: 'args';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadArgs(options: ArgSourceOptions): any {
  return readArgs(options);
}

export function readArgs(options: ArgSourceOptions): Array<string> {
  const proc = options.process || process;
  return proc.argv;
}
