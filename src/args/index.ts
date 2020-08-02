import { NotImplementedError } from '@apextoaster/js-utils';

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function loadArgs<T extends object>(args: Array<string>): T {
  throw new NotImplementedError();
}

export function readArgs(proc = process): Array<string> {
  return proc.argv;
}
