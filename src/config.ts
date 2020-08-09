import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Ajv } from 'ajv';

import { ArgSourceOptions, loadArgs } from './args';
import { EnvSourceOptions, loadEnv } from './env';
import { InvalidDataError } from './error/InvalidDataError';
import { FileSourceOptions, loadFile } from './file';

export interface BaseSourceOptions {
  key: string;
  type: string;
}

export interface ConstSourceOptions extends BaseSourceOptions {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any;
  type: 'const';
}

export type SourceOptions = ArgSourceOptions | ConstSourceOptions | EnvSourceOptions | FileSourceOptions;

export interface ConfigOptions {
  key: string;
  schema: Ajv;
  sources: Array<SourceOptions>;
}

export class Config<TData> {
  /* eslint-disable */
  protected readonly data: Partial<TData>;
  protected readonly schema: Ajv;
  /* eslint-enable */

  constructor(options: ConfigOptions) {
    this.data = {};
    this.schema = options.schema;

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

  public loadSources(sources: Array<SourceOptions>): Array<unknown> {
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
    const valid = this.schema.validate({
      $ref: key,
    }, data);
    if (valid === true) {
      return [];
    } else {
      return mustExist(this.schema.errors);
    }
  }

  protected mergeData(datum: Partial<TData>) {
    Object.assign(this.data, datum);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  protected mergeSource(source: SourceOptions, datum: any): Array<unknown> {
    const valid = this.schema.validate({
      $ref: source.key,
    }, datum);
    if (valid === true) {
      this.mergeData(datum);
      return [];
    } else {
      return mustExist(this.schema.errors);
    }
  }
}
