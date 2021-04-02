import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import findAll from '@ember/test-helpers/dom/find-all';
import { getOwner } from '@ember/application';

const STACKS = {
  'template/nested-component#refresh(ref)': [
    "component/nested-component#refresh :: template/nested-component#refresh(ref)",
    "component/my-component#refresh :: template/nested-component#refresh(ref)",
    "route/application#refresh :: template/nested-component#refresh(ref)",
    "route/application#didTransition"
  ],
  'template/nested-component#refresh(str)': [
    "component/nested-component#refresh :: template/nested-component#refresh(str)",
    "component/my-component#refresh :: template/nested-component#refresh(str)",
    "route/application#refresh :: template/nested-component#refresh(str)",
    "route/application#didTransition"
  ],
  'template/nested-component#update(str)': [
    "component/nested-component#update :: template/nested-component#update(str)"
  ],

  'template/nested-glimmer-component#refresh(arg)': [
    "component/nested-component#refresh :: template/nested-glimmer-component#refresh(arg)",
    "component/my-component#refresh :: template/nested-glimmer-component#refresh(arg)",
    "route/application#refresh :: template/nested-glimmer-component#refresh(arg)",
    "route/application#didTransition",
  ],

  'template/my-component#refresh(str)': [
    "component/my-component#refresh :: template/my-component#refresh(str)",
    "route/application#refresh :: template/my-component#refresh(str)",
    "route/application#didTransition",
  ],
  'template/my-component#refresh(ref)': [
    "component/my-component#refresh :: template/my-component#refresh(ref)",
    "route/application#refresh :: template/my-component#refresh(ref)",
    "route/application#didTransition"
  ],
  'template/my-component#didInsertElement': [
    "component/my-component#didInsertElement :: template/my-component#didInsertElement",
    "route/application#refresh :: template/my-component#didInsertElement",
    "route/application#didTransition",
  ],

  'template/scoped-component#refreshModel(str)': [
    "component/scoped-component#refreshModel :: template/scoped-component#refreshModel(str)",
    "controller/application#refreshModel :: template/scoped-component#refreshModel(str)",
    "route/application#refresh :: template/scoped-component#refreshModel(str)",
    "route/application#didTransition",
  ],
  'template/scoped-component#refresh(ref)': [
    "component/scoped-component#refreshModel :: template/scoped-component#refresh(ref)",
    "controller/application#refreshModel :: template/scoped-component#refresh(ref)",
    "route/application#refresh :: template/scoped-component#refresh(ref)",
    "route/application#didTransition",
  ],

  'template/application#change': [
    "controller/application#change :: template/application#change",
  ],
  'template/application#options.refresh': [
    "controller/application#refreshModel :: template/application#options.refresh",
    "route/application#refresh :: template/application#options.refresh",
    "route/application#didTransition",
  ],
  'template/application#options.refreshAll': [
    "controller/application#refreshModel :: template/application#options.refreshAll",
    "route/application#refresh :: template/application#options.refreshAll",
    "route/application#didTransition",
  ],
};

async function findButton(text) {
  let buttons = await findAll('button');

  return buttons.find(b => b.textContent.trim() === text);
}

function testButtonClick(name) {
  const ExpectedStack = STACKS[name];

  test(`click ${name}`, async function(assert) {
    await visit('/');

    this.tracing.clear();
    let button = await findButton(name);
    await click(button);

    let stack = this.tracing.stack.toArray();
    assert.deepEqual(stack, ExpectedStack, `Stack is correct for click`);
  });
}

module('Acceptance | stack tracing', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.tracing = getOwner(this).lookup('service:trace');
  });

  test('visiting /', async function(assert) {
    await visit('/');

    assert.equal(currentURL(), '/');

    let buttons = await findAll('button');
    let buttonTexts = Object.keys(STACKS);
    assert.equal(buttons.length, buttonTexts.length + 1, 'we have the correct number of buttons');

    for (let text of buttonTexts) {
      let found = buttons.find(b => {
        let t = b.textContent.trim();
        return t === text;
      });
      assert.equal(!!found, true, `Found button ${text}`);
    }
  });

  Object.keys(STACKS).forEach(testButtonClick);
});
