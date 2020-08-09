import { BaseError } from 'noicejs';

export class InvalidDataError extends BaseError {
  constructor(msg = 'invalid data', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
