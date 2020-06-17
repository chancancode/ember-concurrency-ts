import 'ember-concurrency-async';
import {
  Task,
  TaskInstance,
  AsyncTaskFunction as GenericAsyncTaskFunction,
  AsyncTaskFunctionArgs as Args,
  AsyncTaskFunctionReturnType as Return,
  AsyncEncapsulatedTaskDescriptor as GenericAsyncDescriptor,
  AsyncEncapsulatedTaskDescriptorArgs as DescriptorArgs,
  AsyncEncapsulatedTaskDescriptorReturnType as DescriptorReturn
} from 'ember-concurrency';
import { taskFor, perform, Descriptor } from 'ember-concurrency-ts';

type AsyncTaskFunction = GenericAsyncTaskFunction<any, any[]>;
type AsyncTaskFor<T extends AsyncTaskFunction> = Task<Return<T>, Args<T>>;
type AsyncInstanceFor<T extends AsyncTaskFunction> = TaskInstance<Return<T>>;

type AsyncDescriptor = GenericAsyncDescriptor<any, any[]>;
type AsyncTaskForDescriptor<T extends AsyncDescriptor> = Task<DescriptorReturn<T>, DescriptorArgs<T>>;
type AsyncInstanceForDescriptor<T extends AsyncDescriptor> = TaskInstance<DescriptorReturn<T>>;

declare module 'ember-concurrency-ts' {
  function taskFor<T extends AsyncTaskFunction>(task: T): AsyncTaskFor<T>;
  function taskFor<T extends AsyncDescriptor>(task: T): AsyncTaskForDescriptor<T>;

  function perform<T extends AsyncTaskFunction>(task: T, ...args: Args<T>): AsyncInstanceFor<T>;
  function perform<T extends AsyncDescriptor>(task: T, ...args: DescriptorArgs<T>): AsyncInstanceForDescriptor<T>;
}
