import { doesExist, InvalidArgumentError, mustExist, Optional } from '@apextoaster/js-utils';
import { createSchema, SchemaOptions } from '@apextoaster/js-yaml-schema';
import Ajv, { Ajv as AjvInstance, Options as AjvOptions } from 'ajv';

import { ArgSourceOptions, loadArgs } from './args';
import { EnvSourceOptions, loadEnv } from './env';
import { InvalidDataError } from './error/InvalidDataError';
import { FileSourceOptions, loadFile } from './file';

export interface ProcessLike {
  argv: Array<string>;
  env: Record<string, string | undefined>;
}

export interface BaseSourceOptions {
  key: string;
  type: string;
}

export interface ConstSourceOptions<TData> extends BaseSourceOptions {
  data: Partial<TData>;
  type: 'const';
}

export type SourceOptions<TData> = ArgSourceOptions<TData> | ConstSourceOptions<TData> | EnvSourceOptions | FileSourceOptions;

export interface ConfigOptions<TData> {
  key: string;
  validator: AjvInstance;
  sources: Array<SourceOptions<TData>>;
}

export class Config<TData> {
  /* eslint-disable */
  protected readonly data: Partial<TData>;
  protected readonly validator: AjvInstance;
  /* eslint-enable */

  constructor(options: ConfigOptions<TData>) {
    this.data = {};
    this.validator = options.validator;

    const sourceErrors = this.loadSources(options.sources);
    if (sourceErrors.length > 0) {
      throw new InvalidDataError();
    }

    const schemaErrors = this.validateData(options.key);
    if (schemaErrors.length > 0) {
      throw new InvalidDataError();
    }
  }

  public getData(): Readonly<TData> {
    return this.data as Readonly<TData>;
  }

  public loadSources(sources: Array<SourceOptions<TData>>): Array<unknown> {
    const errors = [];

    for (const source of sources) {
      switch (source.type) {
        case 'args':
          errors.push(...this.mergeSource(source, loadArgs(source)));
          break;
        case 'const':
          errors.push(...this.mergeSource(source, source.data));
          break;
        case 'env':
          errors.push(...this.mergeSource(source, loadEnv(source)));
          break;
        case 'file':
          errors.push(...this.mergeSource(source, loadFile(source)));
          break;
        default:
          throw new InvalidArgumentError('unknown source type');
      }
    }

    return errors;
  }

  public validateData(key: string, data = this.data): Array<unknown> {
    const valid = this.validator.validate({
      $ref: key,
    }, data);
    if (valid === true) {
      return [];
    } else {
      return mustExist(this.validator.errors);
    }
  }

  protected mergeData(datum: Partial<TData>) {
    Object.assign(this.data, datum);
  }

  protected mergeSource(source: SourceOptions<TData>, datum: Partial<TData>): Array<unknown> {
    const valid = this.validator.validate({
      $ref: source.key,
    }, datum);
    if (valid === true) {
      this.mergeData(datum);
      return [];
    } else {
      return mustExist(this.validator.errors);
    }
  }
}

// from https://github.com/microsoft/TypeScript/issues/23199#issuecomment-379323872
type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

interface FullOptions<TData> {
  config: Omit<ConfigOptions<TData>, 'schema'>;
  defer: {
    home: FilteredKeys<TData, string>;
    paths: FilteredKeys<TData, string>;
    name: FilteredKeys<TData, string>;
  };
  process: Optional<ProcessLike>;
  schema: SchemaOptions;
  validator: AjvInstance | AjvOptions;
}

export function createAjv(options: AjvInstance | AjvOptions): AjvInstance {
  if (options instanceof Ajv) {
    return options;
  } else {
    return new Ajv(options);
  }
}

/**
 * @public
 */
export function createConfig<TData>(options: FullOptions<TData>) {
  createSchema(options.schema);

  const validator = createAjv(options.validator);
  const config = new Config<TData>({
    ...options.config,
    validator,
  });

  const data = config.getData();
  const paths: Array<string> = [];

  const name = data[options.defer.name];
  /* eslint-disable-next-line @typescript-eslint/tslint/config */
  if (typeof name === 'string') {
    const dataPaths = data[options.defer.paths];
    if (Array.isArray(dataPaths)) {
      paths.push(...dataPaths);
    }

    const dataHome = data[options.defer.home];
    /* eslint-disable-next-line @typescript-eslint/tslint/config */
    if (typeof dataHome === 'string') {
      const home = (options.process || process).env[dataHome];
      if (doesExist(home)) {
        paths.push(home);
      }
    }

    const { include } = options.schema;

    config.loadSources([{
      include,
      key: '',
      name,
      paths,
      type: 'file',
    }]);
  }

  return config;
}
