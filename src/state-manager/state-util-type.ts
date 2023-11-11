export enum ErrorType {
  UnwantedQuery = 'UnwantedQuery',
}

export type ExpectedErrorType = {
  type: ErrorType;
  message?: string;
};

export class ExpectedError implements ExpectedErrorType {
  public message?: string;

  constructor(public readonly type: ErrorType, message?: string) {
    this.message = message;
  }
}
