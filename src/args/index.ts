import { Optional } from '@apextoaster/js-utils';

import { BaseSourceOptions, ProcessLike } from '../config';

export interface Parser<TData> {
  parse(argv: Array<string>): TData;
}

export interface ArgSourceOptions<TData> extends BaseSourceOptions {
  parser: Parser<TData>;
  process: Optional<ProcessLike>;
  type: 'args';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadArgs<TData>(options: ArgSourceOptions<TData>): TData {
  return options.parser.parse(readArgs(options));
}

export function readArgs<TData>(options: ArgSourceOptions<TData>): Array<string> {
  const proc = options.process || process;
  return proc.argv;
}
