ember-concurrency-ts
==============================================================================

TypeScript utilities for [ember-concurrency][e-c].

This is how you would typically write [ember-concurrency][e-c] tasks in Octane
using [ember-concurrency-decorators][e-c-d]:

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

export default class extends Component {
  @task *myTask(ms: number): TaskGenerator<string> {
    yield timeout(ms);
    return 'done!';
  }

  @action performTask() {
    if (this.myTask.isRunning) {
      return;
    }

    this.myTask.perform(1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

Since we are using native classes in Octane, TypeScript have an easier time
understanding and following our code. Normally, this is a good thing, but in
the case of ember-concurrency, it ends up getting a bit in the way.

ember-concurrency's API was designed with Class Ember in mind, where it could
decorate a property or method and replace it with a different type in the
`.extend()` hook.

This is not allowed using TypeScript's decorators. Since `myTask` is defined
using as the generator method syntax, and since methods do not have a
`.perform()` method on them, calling `this.myTask.perform()` will result in a
type error, even though it will work at runtime.

We could work around this by type casting the method, such as
`(this.myTask as any as Task<string, number>)`, but doing this everywhere is
quite verbose and error-prone.

Instead, this addon provides some TypeScript-specific utility functions to
encapsulate the type cast transparently. See the [Usage](#usage) section for
details.


Compatibility
------------------------------------------------------------------------------

* [ember-concurrency][e-c] 1.2.0 or above
* [ember-concurrency-decorators][e-c-d] 2.0.0 or above
* [ember-concurrency-async][e-c-async] 0.2.0 or above (optional)
* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above
* TypeScript 3.7 or 3.9


Installation
------------------------------------------------------------------------------

```
ember install ember-concurrency-ts
```

Optionally, if using [ember-concurrency-async][e-c-async], add the following to
`types/<app name>/index.d.ts`:

```ts
import 'ember-concurrency-async';
import 'ember-concurrency-ts/async';
```


Usage
------------------------------------------------------------------------------

### `taskFor`

The `taskFor` utility function allows the code example from above to type
check:

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

export default class extends Component {
  @task *myTask(ms: number): TaskGenerator<string> {
    yield timeout(ms);
    return 'done!';
  }

  @action performTask() {
    if (taskFor(this.myTask).isRunning) {
      return;
    }

    taskFor(this.myTask).perform(1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

Instead of accessing the task directly, wrapping it in the `taskFor` utility
function will allow TypeScript to understand what we are trying to accomplish.
If this becomes repetitive, you may extract it into a variable or getter, and
the code will still type check:

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

export default class extends Component {
  @task *myTask(ms: number): TaskGenerator<string> {
    yield timeout(ms);
    return 'done!';
  }

  @action performTask() {
    let myTask = taskFor(this.myTask);

    if (myTask.isRunning) {
      return;
    }

    myTask.perform(1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

Note that everything on the task is type-inferred from the method definition.
Based on the return type of `*myTask`, TypeScript knows that `myTask.value` is
`string | undefined`. Likewise, it knows that `myTask.perform()` takes the same
arguments as `*myTask`. Passing the wrong arguments will be a type error. It
also knows that the `value` promise callback parameter is a `string`.

#### Alternate usage of `taskFor`

The `taskFor` utility function can also be used at assignment:

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

export default class extends Component {
  @task myTask = taskFor(function*(ms: number): TaskGenerator<string> {
    yield timeout(ms);
    return 'done!';
  });

  @action performTask() {
    if (this.myTask.isRunning) {
      return;
    }

    this.myTask.perform(1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

This allows you to access the task directly without using `taskFor` and `perform`. The one
caveat here is that the `this` type must be asserted if you are referencing `this` in your task:

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

export default class MyComponent extends Component {
  returnVal = 'done';

  @task myTask = taskFor(function*(this: MyComponent, ms: number): TaskGenerator<string> {
    yield timeout(ms);
    return this.returnVal;
  });

  @action performTask() {
    if (this.myTask.isRunning) {
      return;
    }

    this.myTask.perform(1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

### `perform`

As a convenience, this addon also provide a `perform` utility function as a
shorthand for `myTask(...).perform(...)`:

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { perform } from 'ember-concurrency-ts';

export default class extends Component {
  @task *myTask(ms: number): TaskGenerator<string> {
    yield timeout(ms);
    return 'done!';
  }

  @action performTask() {
    perform(this.myTask, 1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

Just like `taskFor`, it infers the type information from `*myTask`, type checks
the arguments as has the right return type, etc.

### `ember-concurrency-async`

This addon can be used together with [ember-concurrency-async][e-c-async], see
the [Installation](#installation) section for additional instructions.

```ts
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor, perform } from 'ember-concurrency-ts';

export default class extends Component {
  @task async myTask(ms: number): Promise<string> {
    await timeout(ms);
    return 'done!';
  }

  @action performTask() {
    if (taskFor(this.myTask).isRunning) {
      return;
    }

    perform(this.myTask, 1000).then(value => {
      console.log(value.toUpperCase());
    });
  }
}
```

### Type Safety

Under-the-hood, these utility functions are just implemented as [unsafe type
casts](./addon/index.js). For example, the examples will still type check if
the `@task` decorator is omitted (so `this.myTask` is just a regular generator
or async method), but you will get an error at runtime.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).


[e-c]: https://github.com/machty/ember-concurrency
[e-c-d]: https://github.com/machty/ember-concurrency-decorators
[e-c-async]: https://github.com/chancancode/ember-concurrency-async
