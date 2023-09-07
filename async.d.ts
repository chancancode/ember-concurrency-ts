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

declare module 'ember-concurrency-ts' {
  function taskFor<HostObject, T extends AsyncTaskFunction>(task: T): AsyncTaskFor<HostObject, T>;
  function taskFor<T extends AsyncDescriptor>(task: T): AsyncTaskForDescriptor<T>;

  function perform<HostObject, T extends AsyncTaskFunction>(task: T, ...args: Args<T>): AsyncInstanceFor<HostObject, T>;
  function perform<T extends AsyncDescriptor>(task: T, ...args: DescriptorArgs<T>): AsyncInstanceForDescriptor<T>;
}
