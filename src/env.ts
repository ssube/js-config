import { Optional } from '@apextoaster/js-utils';

import { BaseSourceOptions, ProcessLike } from './config';

export interface EnvSourceOptions extends BaseSourceOptions {
  prefix: string;
  process: Optional<ProcessLike>;
  type: 'env';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function loadEnv(options: EnvSourceOptions): any {
  return readEnv(options);
}

/**
 * Read each env var with the given prefix.
 */
export function readEnv(options: EnvSourceOptions): Map<string, string> {
  const env = new Map();
  const proc = options.process || process;

  for (const [key, value] of Object.entries(proc.env)) {
    if (key.startsWith(options.prefix)) {
      env.set(key, value);
    }
  }

  return env;
}
