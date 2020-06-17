export interface Defer<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export function defer<T>(): Defer<T> {
  let resolve: Defer<T>['resolve'];
  let reject: Defer<T>['reject'];

  let promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
