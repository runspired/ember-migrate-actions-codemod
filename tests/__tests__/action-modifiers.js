const actionModifiers = require('../../src/action-modifiers');
const { parse, transform } = require('ember-template-recast');

function codeshift(input, plugin) {
  return plugin(
    {
      path: 'filename.hbs',
      source: input,
    },
    {
      parse,
      visit(ast, callback) {
        const results = transform(ast, callback);
        return results && results.code;
      },
    }
  );
}

const TESTS = [
  [
    'string action name interactive',
    `<button type="reset" {{action "foo" bar}}>button</button>`,
    `<button type="reset" {{on "click" (prevent-default (fn (action "foo") bar))}}>button</button>`
  ],
  [
    'string action name on non-interactive',
    `<span {{action "foo" bar}}>text</span>`,
    `<span {{on "click" (fn (action "foo") bar)}}>text</span>`
  ],
  [
    'on= option',
    `<button {{action "foo" bar on="hover"}}>button</button>`,
    `<button {{on "hover" (fn (action "foo") bar)}}>button</button>`
  ],
  [
    '@arg',
    `<button {{action @bar baz}}>button</button>`,
    `<button {{on "click" (fn @bar baz)}}>button</button>`
  ],
  [
    'this.',
    `<button {{action this.quux}}>button</button>`,
    `<button {{on "click" this.quux}}>button</button>`
  ],
  [
    'two modifiers',
    `<button {{action bar}} {{action baz on="hover"}}>button</button>`,
    `<button {{on "click" bar}} {{on "hover" baz}}>button</button>`
  ],
  [
    'preventDefault=false',
    `<button type="reset" {{action foo preventDefault=false}}>button</button>`,
    `<button type="reset" {{on "click" foo}}>button</button>`,
  ],
  [
    'bubbles=false',
    `<button {{action foo bubbles=false}}>button</button>`,
    `<button {{on "click" (stop-propagation foo)}}>button</button>`,
  ],
  [
    'bubbles=true',
    `<button {{action foo bubbles=true}}>button</button>`,
    `<button {{on "click" foo}}>button</button>`,
  ],
  [
    'preventDefault and bubbles',
    `<button type="reset" {{action foo preventDefault=false bubbles=false}}>button</button>`,
    `<button type="reset" {{on "click" (stop-propagation foo)}}>button</button>`,
  ],
  [
    'value=',
    `<button {{action foo value="target.value"}}>button</button>`,
    `<button {{on "click" (action foo value="target.value")}}>button</button>`,
  ],
  [
    'target=',
    `<button {{action foo target=someService}}>button</button>`,
    `<button {{on "click" (action foo target=someService)}}>button</button>`,
  ],
  [
    'allowedKeys=',
    `<button {{action foo allowedKeys="alt"}}>button</button>`,
    `<button {{on "click" (action foo allowedKeys="alt")}}>button</button>`,
  ],
  [
    'value && target',
    `<button {{action "foo" value="target.value" target=someService}}>button</button>`,
    `<button {{on "click" (action "foo" value="target.value" target=someService)}}>button</button>`,
  ],
  [
    'preventDefault=this.dynamicValue',
    `<button {{action foo preventDefault=this.dynamicValue}}>button</button>`,
    `<button {{action foo preventDefault=this.dynamicValue}}>button</button>`
  ],
  [
    'bubbles=this.dynamicValue',
    `<button {{action foo bubbles=this.dynamicValue}}>button</button>`,
    `<button {{action foo bubbles=this.dynamicValue}}>button</button>`
  ],
  [
    'mut',
    `<button {{action (action (mut this.enabled) false)}}>button</button>`,
    `<button {{on "click" (fn (mut this.enabled) false)}}>button</button>`
  ],
  [
    'closure actions',
    `<button {{action (action "foo" false)}}>button</button>`,
    `<button {{on "click" (fn (action "foo") false)}}>button</button>`
  ],
  [
    'idempotent',
    `<button {{on "click" (fn (action "foo") false)}}>button</button>`,
    `<button {{on "click" (fn (action "foo") false)}}>button</button>`
  ]
];

TESTS.forEach(([name, input, expectedOutput]) => {
  it(name, () => {
    const output = codeshift(input, actionModifiers);
    expect((output || '').trim()).toEqual(expectedOutput.trim());
  });
});
