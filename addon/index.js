import { assert } from '@ember/debug';

export function taskFor(task) {
  assert(
    `${task} does not appear to be a task!`,
    task && typeof task.perform === 'function'
  );

  return task;
}

export function perform(task, ...args) {
  assert(
    `${task} does not appear to be a task!`,
    task && typeof task.perform === 'function'
  );

  return task.perform(...args);
}
