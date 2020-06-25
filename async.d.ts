import 'ember-concurrency-async';
import {
  TaskForAsyncTaskFunction as AsyncTaskFor,
  TaskForAsyncEncapsulatedTaskDescriptor as AsyncTaskForDescriptor,
  TaskInstanceForAsyncTaskFunction as AsyncInstanceFor,
  TaskInstanceForAsyncEncapsulatedTaskDescriptor as AsyncInstanceForDescriptor,
  AsyncTaskFunction as GenericAsyncTaskFunction,
  AsyncTaskFunctionArgs as Args,
  AsyncEncapsulatedTaskDescriptor as GenericAsyncDescriptor,
  AsyncEncapsulatedTaskDescriptorArgs as DescriptorArgs
} from 'ember-concurrency';
import { taskFor, perform, Descriptor } from 'ember-concurrency-ts';

type AsyncTaskFunction = GenericAsyncTaskFunction<any, any[]>;
type AsyncDescriptor = GenericAsyncDescriptor<any, any[]>;

declare module 'ember-concurrency-ts' {
  function taskFor<T extends AsyncTaskFunction>(task: T): AsyncTaskFor<T>;
  function taskFor<T extends AsyncDescriptor>(task: T): AsyncTaskForDescriptor<T>;

  function perform<T extends AsyncTaskFunction>(task: T, ...args: Args<T>): AsyncInstanceFor<T>;
  function perform<T extends AsyncDescriptor>(task: T, ...args: DescriptorArgs<T>): AsyncInstanceForDescriptor<T>;
}
