import { Optional } from '@apextoaster/js-utils';
import { Argv } from 'yargs';

import { BaseSourceOptions, ProcessLike } from '../config';

export interface ArgSourceOptions extends BaseSourceOptions {
  parser: Argv<unknown>;
  process: Optional<ProcessLike>;
  type: 'args';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadArgs(options: ArgSourceOptions): any {
  return options.parser.parse(readArgs(options));
}

export function readArgs(options: ArgSourceOptions): Array<string> {
  const proc = options.process || process;
  return proc.argv;
}
