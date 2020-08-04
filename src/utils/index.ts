import { includeSchema } from '@apextoaster/js-yaml-schema';

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
    paths.push(includeSchema.join(home, name));
  }

  if (__dirname !== '') {
    paths.push(includeSchema.join(__dirname, name));
  }

  for (const e of extras) {
    paths.push(includeSchema.join(e, name));
  }

  return paths;
}
