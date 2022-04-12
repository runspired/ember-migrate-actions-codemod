# Ember Action Codemods

## Usage

### Install dependencies

Run

```sh
volta install ember-template-recast
volta install jscodeshift
```

You may also want:

```sh
yarn add ember-event-helpers
# if you're on ember-source 3.9 or below
yarn add ember-on-modifier ember-fn-helper-polyfill
```

### Step 1: Convert `{{action}}` modifiers to `{{on}}` modifiers

This is the safest of the codemods.

```sh
ember-template-recast app/ -t \
  https://raw.githubusercontent.com/runspired/ember-migrate-actions-codemod/main/src/action-modifiers.js
```

### Step 2: Convert `onclick={{action foo}}` to `{{on "click" foo}}`

Switching from event properties to Ember modifiers can have subtle behavior
changes regarding event ordering!

See https://developer.squareup.com/blog/deep-dive-on-ember-events/
for a comprehensive rundown.

```sh
ember-template-recast app/ -t \
  https://raw.githubusercontent.com/runspired/ember-migrate-actions-codemod/main/src/event-properties.js
```

### Step 3: Convert `action` hashes in JavaScript to decorated properties:

Requires Ember.js 3.10 and above. This will

- eliminate redundant actions
- eliminate usage of `sendAction`
- replace usages of `send` that can be direct invocation
- ⚠️ rename action usage where names conflict with framework methods/props on component/route/controller\*
- no-op for name conflicts with other methods/properties on the class.

After running this be sure to find any remaining actions hash usages and
remove them! Hopefully this will leave only a small handful of cases unmigrated.

\*Step 4 will rename action usage in templates where names conflict with framework methods/props on component/route/controller to keep these in sync; however, some instances of
string action passing may not be detectable and therefore may not be migrated. Most
commonly this will occur when passing an action as a string argument `{{my-component someAction="myActionName"}}`.

This step produces a meta file which step-4 consumes which must be kept checked in
after running until step-4 is completed.

```sh
jscodeshift app/ -t \
  https://raw.githubusercontent.com/runspired/ember-migrate-actions-codemod/main/src/action-decorators.js
```

### Step 4: Convert string actions to properties

This will change all string action usage into method action usage. On it's own this is
safe to do once there is no longer any usage of the `actions: {}` hash on controllers
or components.

Additionally this will attempt to rename action usages to avoid conflicts with built-ins,
including by detecting most instances of actions being passed as args as strings such as
`{{my-component someAction="myActionName"}}`. This is accomplished by building a map in
step 3 of what actions each component and controller provides, and building a map in step 4
of which are used. Common places where this might fail include yielding out strings from
a component to use as actions.

```sh
ember-template-recast app/ -t \
  https://raw.githubusercontent.com/runspired/ember-migrate-actions-codemod/main/src/string-actions.js
```

## What does it do?

Check out the tests!

- [action-modifiers.js](src/__tests__/action-modifiers.js)

  `<button {{action foo}}>` → `<button {{on "click" (prevent-default foo)}}>`

- [event-properties.js](src/__tests__/event-properties.js)

  `<button onclick={{action foo}}>` → `<button {{on "click" (prevent-default foo)}}>`

- [action-decorators.js](src/__testfixtures__/action-decorators/)

  ```js
  actions: {
    foo() {}
  }
  ```

  →

  ```js
  foo: action(function () {});
  ```

- [string-actions.js](src/__tests__/string-actions.js)

  `<button {{on "click" (action "foo")}}>` → `<button {{on "click" this.foo}}>`

## TODO:

- Remove uses of the `(action)` helper that remain due to use of `value=`, `target=`, and `allowedKeys=`.
