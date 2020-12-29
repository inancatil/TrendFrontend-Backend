export interface ICustomErrorHandler extends Error {
  code: number;
}

class HttpError extends Error {
  code: number;
  data?: any;
  constructor(message: string, errorCode: number, data?: any) {
    super(message);
    this.code = errorCode;
    this.data = data;
  }
}

export default HttpError;
