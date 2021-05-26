import 'qunit-dom';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { action, computed, set } from '@ember/object';
import { click, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  task,
  Task,
  TaskGenerator,
  TaskInstance,
  EncapsulatedTask,
  EncapsulatedTaskDescriptor,
  EncapsulatedTaskState,
} from 'ember-concurrency';
import { taskFor, perform } from 'ember-concurrency-ts';
import { expectTypeOf } from 'expect-type';
import Component from '@glimmer/component';
import { defer } from 'dummy/tests/utils';

type EncapsulatedTaskInstance<T, State extends object> = TaskInstance<T> & EncapsulatedTaskState<State>;

module('Integration | ember-concurrency-ts', function(hooks) {
  setupRenderingTest(hooks);

  test('it works', async function(assert) {
    let { promise, resolve } = defer<string>();

    class MyComponent extends Component {
      resolved: string | null = null;
      lastValue: string | null = null;

      @task *myTask(arg: string): TaskGenerator<string> {
        set(this, 'resolved', yield promise);
        return arg;
      }

      _() {
        expectTypeOf(this.myTask).toMatchTypeOf<Function>();
        expectTypeOf(taskFor(this.myTask)).toEqualTypeOf<Task<string, [string]>>();
      }

      @computed('myTask.performCount')
      get isWaiting(): boolean {
        expectTypeOf(taskFor(this.myTask).performCount).toEqualTypeOf<number>();
        return taskFor(this.myTask).performCount === 0;
      }

      @computed('myTask.isRunning')
      get isRunning(): boolean {
        expectTypeOf(taskFor(this.myTask).isRunning).toEqualTypeOf<boolean>();
        return taskFor(this.myTask).isRunning;
      }

      @computed('myTask.last.value')
      get value(): string | null | undefined {
        expectTypeOf(taskFor(this.myTask).last).toEqualTypeOf<TaskInstance<string> | null>();
        expectTypeOf(taskFor(this.myTask).last!.value).toEqualTypeOf<string | null>();
        return taskFor(this.myTask).last?.value;
      }

      @action performMyTask(arg: string) {
        perform(this.myTask, arg).then(value => {
          expectTypeOf(value).toEqualTypeOf<string>();
          set(this, 'lastValue', value);
        });
      }
    }

    this.owner.register('component:test', MyComponent);

    this.owner.register('template:components/test', hbs`
      {{#if this.isWaiting}}
        <button id="start" {{on "click" (fn this.performMyTask "Done!")}}>Start!</button>
      {{else if this.isRunning}}
        Running!
      {{else}}
        Finished!
        <span id="state">{{this.myTask.state}}</span>
        <span id="value">{{this.value}}</span>
        <span id="resolved">{{this.resolved}}</span>
      {{/if}}
    `);

    await render(hbs`<Test />`);

    assert.dom('button#start').hasText('Start!');
    assert.dom().doesNotContainText('Running!');
    assert.dom().doesNotContainText('Finished!');

    await click('button#start');

    assert.dom('button#start').doesNotExist();
    assert.dom().containsText('Running!');
    assert.dom().doesNotContainText('Finished!');

    resolve('Wow!');

    await settled();

    assert.dom('button#start').doesNotExist();
    assert.dom().doesNotContainText('Running!');
    assert.dom().containsText('Finished!');
    assert.dom('#state').hasText('idle');
    assert.dom('#value').hasText('Done!');
    assert.dom('#resolved').hasText('Wow!');
  });

  test('it works for encapsulated tasks', async function(assert) {
    let { promise, resolve } = defer<string>();

    class MyComponent extends Component {
      lastValue: string | null = null;

      @task myTask = {
        resolved: '',
        *perform(arg: string): TaskGenerator<string> {
          expectTypeOf(this).not.toBeAny();
          expectTypeOf(this.resolved).not.toBeAny();
          expectTypeOf(this.resolved).toBeString();
          set(this, 'resolved', yield promise);
          return arg;
        }
      }

      _() {
        expectTypeOf(this.myTask).toMatchTypeOf<EncapsulatedTaskDescriptor<string, [string]>>();
        expectTypeOf(taskFor(this.myTask)).toEqualTypeOf<EncapsulatedTask<string, [string], { resolved: string }>>();
      }

      @computed('myTask.performCount')
      get isWaiting(): boolean {
        expectTypeOf(taskFor(this.myTask).performCount).toEqualTypeOf<number>();
        return taskFor(this.myTask).performCount === 0;
      }

      @computed('myTask.isRunning')
      get isRunning(): boolean {
        expectTypeOf(taskFor(this.myTask).isRunning).toEqualTypeOf<boolean>();
        return taskFor(this.myTask).isRunning;
      }

      @computed('myTask.last.value')
      get value(): string | null | undefined {
        expectTypeOf(taskFor(this.myTask).last).toEqualTypeOf<EncapsulatedTaskInstance<string, { resolved: string }> | null>();
        expectTypeOf(taskFor(this.myTask).last!.value).toEqualTypeOf<string | null>();
        return taskFor(this.myTask).last?.value;
      }

      @computed('myTask.resolved')
      get resolved(): string | undefined {
        expectTypeOf(taskFor(this.myTask).last?.resolved).toEqualTypeOf<string>();
        return taskFor(this.myTask).last?.resolved;
      }

      @action performMyTask(arg: string) {
        perform(this.myTask, arg).then(value => {
          expectTypeOf(value).toEqualTypeOf<string>();
          set(this, 'lastValue', value);
        });
      }
    }

    this.owner.register('component:test', MyComponent);

    this.owner.register('template:components/test', hbs`
      {{#if this.isWaiting}}
        <button id="start" {{on "click" (fn this.performMyTask "Done!")}}>Start!</button>
      {{else if this.isRunning}}
        Running!
      {{else}}
        Finished!
        <span id="state">{{this.myTask.state}}</span>
        <span id="value">{{this.value}}</span>
        <span id="resolved">{{this.resolved}}</span>
      {{/if}}
    `);

    await render(hbs`<Test />`);

    assert.dom('button#start').hasText('Start!');
    assert.dom().doesNotContainText('Running!');
    assert.dom().doesNotContainText('Finished!');

    await click('button#start');

    assert.dom('button#start').doesNotExist();
    assert.dom().containsText('Running!');
    assert.dom().doesNotContainText('Finished!');

    resolve('Wow!');

    await settled();

    assert.dom('button#start').doesNotExist();
    assert.dom().doesNotContainText('Running!');
    assert.dom().containsText('Finished!');
    assert.dom('#state').hasText('idle');
    assert.dom('#value').hasText('Done!');
    assert.dom('#resolved').hasText('Wow!');
  });

  test('it works at assignment', async function(assert) {
    let { promise, resolve } = defer<string>();

    class MyComponent extends Component {
      resolved: string | null = null;
      lastValue: string | null = null;

      @task myTask = taskFor(function*(this: MyComponent, arg: string): TaskGenerator<string> {
        expectTypeOf(this).not.toBeAny();
        expectTypeOf(this.resolved).not.toBeAny();
        expectTypeOf(this.resolved).toMatchTypeOf<string | null>();
        set(this, 'resolved', yield promise);
        return arg;
      });

      _() {
        expectTypeOf(this.myTask).toMatchTypeOf<Task<unknown, unknown[]>>();
      }

      @computed('myTask.performCount')
      get isWaiting(): boolean {
        expectTypeOf(this.myTask.performCount).toEqualTypeOf<number>();
        return this.myTask.performCount === 0;
      }

      @computed('myTask.isRunning')
      get isRunning(): boolean {
        expectTypeOf(this.myTask.isRunning).toEqualTypeOf<boolean>();
        return this.myTask.isRunning;
      }

      @computed('myTask.last.value')
      get value(): string | null | undefined {
        expectTypeOf(this.myTask.last).toEqualTypeOf<TaskInstance<string> | null>();
        expectTypeOf(this.myTask.last!.value).toEqualTypeOf<string | null>();
        return this.myTask.last?.value;
      }

      @action performMyTask(arg: string) {
        this.myTask.perform(arg).then(value => {
          expectTypeOf(value).toEqualTypeOf<string>();
          set(this, 'lastValue', value);
        });
      }
    }

    this.owner.register('component:test', MyComponent);

    this.owner.register('template:components/test', hbs`
      {{#if this.isWaiting}}
        <button id="start" {{on "click" (fn this.performMyTask "Done!")}}>Start!</button>
      {{else if this.isRunning}}
        Running!
      {{else}}
        Finished!
        <span id="state">{{this.myTask.state}}</span>
        <span id="value">{{this.value}}</span>
        <span id="resolved">{{this.resolved}}</span>
      {{/if}}
    `);

    await render(hbs`<Test />`);

    assert.dom('button#start').hasText('Start!');
    assert.dom().doesNotContainText('Running!');
    assert.dom().doesNotContainText('Finished!');

    await click('button#start');

    assert.dom('button#start').doesNotExist();
    assert.dom().containsText('Running!');
    assert.dom().doesNotContainText('Finished!');

    resolve('Wow!');

    await settled();

    assert.dom('button#start').doesNotExist();
    assert.dom().doesNotContainText('Running!');
    assert.dom().containsText('Finished!');
    assert.dom('#state').hasText('idle');
    assert.dom('#value').hasText('Done!');
    assert.dom('#resolved').hasText('Wow!');
  });

  test('it works for encapsulated tasks at assignment', async function(assert) {
    let { promise, resolve } = defer<string>();

    class MyComponent extends Component {
      lastValue: string | null = null;

      @task myTask = taskFor({
        resolved: '',
        *perform(arg: string): TaskGenerator<string> {
          expectTypeOf(this).not.toBeAny();
          expectTypeOf(this.resolved).not.toBeAny();
          expectTypeOf(this.resolved).toBeString();
          set(this, 'resolved', yield promise);
          return arg;
        }
      });

      _() {
        expectTypeOf(this.myTask).toMatchTypeOf<EncapsulatedTask<string, [string], { resolved: string }>>();
      }

      @computed('myTask.performCount')
      get isWaiting(): boolean {
        expectTypeOf(this.myTask.performCount).toEqualTypeOf<number>();
        return this.myTask.performCount === 0;
      }

      @computed('myTask.isRunning')
      get isRunning(): boolean {
        expectTypeOf(this.myTask.isRunning).toEqualTypeOf<boolean>();
        return this.myTask.isRunning;
      }

      @computed('myTask.last.value')
      get value(): string | null | undefined {
        expectTypeOf(this.myTask.last).toEqualTypeOf<EncapsulatedTaskInstance<string, { resolved: string }> | null>();
        expectTypeOf(this.myTask.last!.value).toEqualTypeOf<string | null>();
        return this.myTask.last?.value;
      }

      @computed('myTask.resolved')
      get resolved(): string | undefined {
        expectTypeOf(this.myTask.last?.resolved).toEqualTypeOf<string>();
        return this.myTask.last?.resolved;
      }

      @action performMyTask(arg: string) {
        this.myTask.perform(arg).then(value => {
          expectTypeOf(value).toEqualTypeOf<string>();
          set(this, 'lastValue', value);
        });
      }
    }

    this.owner.register('component:test', MyComponent);

    this.owner.register('template:components/test', hbs`
      {{#if this.isWaiting}}
        <button id="start" {{on "click" (fn this.performMyTask "Done!")}}>Start!</button>
      {{else if this.isRunning}}
        Running!
      {{else}}
        Finished!
        <span id="state">{{this.myTask.state}}</span>
        <span id="value">{{this.value}}</span>
        <span id="resolved">{{this.resolved}}</span>
      {{/if}}
    `);

    await render(hbs`<Test />`);

    assert.dom('button#start').hasText('Start!');
    assert.dom().doesNotContainText('Running!');
    assert.dom().doesNotContainText('Finished!');

    await click('button#start');

    assert.dom('button#start').doesNotExist();
    assert.dom().containsText('Running!');
    assert.dom().doesNotContainText('Finished!');

    resolve('Wow!');

    await settled();

    assert.dom('button#start').doesNotExist();
    assert.dom().doesNotContainText('Running!');
    assert.dom().containsText('Finished!');
    assert.dom('#state').hasText('idle');
    assert.dom('#value').hasText('Done!');
    assert.dom('#resolved').hasText('Wow!');
  });
});
