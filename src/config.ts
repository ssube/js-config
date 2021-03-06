import { doesExist, InvalidArgumentError, mustExist, Optional } from '@apextoaster/js-utils';
import { createSchema, IncludeOptions, SchemaOptions } from '@apextoaster/js-yaml-schema';
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
  // TODO: look into validating each source with an optional key
  // key: string;
  type: string;
}

export interface ConstSourceOptions<TData> extends BaseSourceOptions {
  data: Partial<TData>;
  type: 'const';
}

export type SourceOptions<TData> = ArgSourceOptions<TData> | ConstSourceOptions<TData> | EnvSourceOptions | Omit<FileSourceOptions, 'include'>;

export interface ConfigOptions<TData> {
  key: string;
  include: IncludeOptions;
  sources: Array<SourceOptions<TData>>;
  validator: AjvInstance;
}

export class Config<TData> {
  protected readonly data: Partial<TData>;
  protected readonly include: IncludeOptions;
  protected readonly validator: AjvInstance;

  constructor(options: ConfigOptions<TData>) {
    this.data = {};
    this.include = options.include;
    this.validator = options.validator;

    this.loadSources(options.sources);
    const schemaErrors = this.validateData(options.key);
    if (schemaErrors.length > 0) {
      throw new InvalidDataError('schema errors');
    }
  }

  public getData(): Readonly<TData> {
    return this.data as Readonly<TData>;
  }

  public loadSources(sources: Array<SourceOptions<TData>>) {
    for (const source of sources) {
      switch (source.type) {
        case 'args':
          this.mergeSource(source, loadArgs(source));
          break;
        case 'const':
          this.mergeSource(source, source.data);
          break;
        case 'env':
          this.mergeSource(source, loadEnv(source));
          break;
        case 'file':
          this.mergeSource(source, loadFile({
            ...source,
            include: this.include,
          }));
          break;
        default:
          throw new InvalidArgumentError('unknown source type');
      }
    }
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

  protected mergeSource(source: SourceOptions<TData>, datum: Partial<TData>) {
    Object.assign(this.data, datum);
  }
}

// from https://github.com/microsoft/TypeScript/issues/23199#issuecomment-379323872
type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

interface DeferOptions<TData> {
  home?: FilteredKeys<TData, string>;
  paths: FilteredKeys<TData, string>;
  name: FilteredKeys<TData, string>;
}

interface CreateOptions<TData> {
  config: Omit<ConfigOptions<TData>, 'include' | 'validator'>;
  defer?: DeferOptions<TData>;
  process: Optional<ProcessLike>;
  schema: SchemaOptions;
  validator?: AjvInstance | AjvOptions;
}

export function createAjv(options: Optional<AjvInstance | AjvOptions>): AjvInstance {
  if (options instanceof Ajv) {
    return options;
  }

  if (doesExist(options)) {
    return new Ajv(options);
  }

  return new Ajv();
}

/**
 * @public
 */
export function createConfig<TData>(options: CreateOptions<TData>) {
  const schema = createSchema(options.schema);
  const validator = createAjv(options.validator);
  const config = new Config<TData>({
    ...options.config,
    include: {
      ...options.schema.include,
      schema,
    },
    validator,
  });

  if (doesExist(options.defer)) {
    deferConfig(config, options, options.defer);
  }

  return config;
}

export function deferConfig<TData>(config: Config<TData>, options: CreateOptions<TData>, defer: DeferOptions<TData>) {
  const data = config.getData();
  const paths: Array<string> = [];

  const name = data[defer.name];
  /* eslint-disable-next-line @typescript-eslint/tslint/config */
  if (typeof name === 'string') {
    const dataPaths = data[defer.paths];
    if (Array.isArray(dataPaths)) {
      paths.push(...dataPaths);
    }

    if (doesExist(defer.home) && defer.home !== '') {
      const dataHome = data[defer.home];
      /* eslint-disable-next-line @typescript-eslint/tslint/config */
      if (typeof dataHome === 'string') {
        const home = (options.process || process).env[dataHome];
        if (doesExist(home)) {
          paths.push(home);
        }
      }
    }

    config.loadSources([{
      name,
      paths,
      type: 'file',
    }]);
  }
}
