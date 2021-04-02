const IS_EMBER_ACTION_CODEMODS_TEST = process.env.IS_EMBER_ACTION_CODEMODS_TEST;
const path = require('path');
const chalk = require('chalk');

const PROXYABLE_ROUTE_METHODS = new Set([
  'transitionTo',
  'refresh',
]);
const ROUTE_METHODS = new Set([  
  // methods
  '_internalReset',
  '_setRouteName',
  '_stashNames',
  '_updatingQPChanged',
  'activate',
  'addObserver',
  'afterModel',
  'beforeModel',
  'beginPropertyChanges',
  'buildRouteInfoMetadata',
  'cacheFor',
  'contextDidChange',
  'controllerFor',
  'deactivate',
  'decrementProperty',
  'deserialize',
  'deserializeQueryParam',
  'destroy',
  'disconnectOutlet',
  'endPropertyChanges',
  'enter',
  'exit',
  'findModel',
  'generateController',
  'get',
  'getProperties',
  'getWithDefault',
  'has',
  'hasObserverFor',
  'incrementProperty',
  'init',
  'intermediateTransitionTo',
  'model',
  'modelFor',
  'notifyPropertyChange',
  'off',
  'on',
  'one',
  'paramsFor',
  'queryParamsDidChange',
  'redirect',
  'refresh',
  'removeObserver',
  'render',
  'renderTemplate',
  'replaceWith',
  'resetController',
  'send',
  'serialize',
  'serializeQueryParam',
  'serializeQueryParamKey',
  'set',
  'setProperties',
  'setup',
  'setupController',
  'teardownViews',
  'toString',
  'toggleProperty',
  'transitionTo',
  'trigger',
  'willDestroy',
]);
const ROUTE_PROPS = new Set([ 
  // properties
  '_activeQPChanged',
  '_names',
  '_optionsForQueryParam',
  '_qp',
  'actions',
  'concatenatedProperties',
  'controller',
  'controllerName',
  'fullRouteName',
  'isDestroyed',
  'isDestroying',
  'mergedProperties',
  'queryParams',
  'routeName',
  'store',
  'templateName',
]);
const ROUTE_EVENTS = new Set([ 
  // events
  'activate',
  'deactivate',
  'didTransition',
  'error',
  'loading',
  'willTransition',
]);

const COMPONENT_METHODS = new Set([
  '$',
  'addObserver',
  'append',
  'appendTo',
  'beginPropertyChanges',
  'cacheFor',
  'decrementProperty',
  'destroy',
  'didReceiveAttrs',
  'didRender',
  'didUpdate',
  'didUpdateAttrs',
  'endPropertyChanges',
  'get',
  'getChildViews',
  'getProperties',
  'getRootViews',
  'getViewBoundingClientRect',
  'getViewBounds',
  'getViewClientRects',
  'getViewElement',
  'getViewId',
  'getViewRange',
  'getWithDefault',
  'handleEvent',
  'has',
  'hasObserverFor',
  'incrementProperty',
  'init',
  'matches',
  'mixin',
  'nearestOfType',
  'nearestWithProperty',
  'notifyPropertyChange',
  'off',
  'on',
  'one',
  'readDOMAttr',
  'removeObserver',
  'rerender',
  'send',
  'sendAction',
  'set',
  'setProperties',
  'toString',
  'toggleProperty',
  'trigger',
  'triggerAction',
  'willDestroy',
  'willRender',
  'willUpdate',
  'didInsertElement',
  'didReceiveAttrs',
  'didRender',
  'didUpdate',
  'didUpdateAttrs',
  'parentViewDidChange',
  'willClearRender',
  'willDestroyElement',
  'willInsertElement',
  'willRender',
  'willUpdate',
]);
const COMPONENT_EVENTS = new Set([
  // events
  'change',
  'click',
  'contextMenu',
  'doubleClick',
  'drag',
  'dragEnd',
  'dragEnter',
  'dragLeave',
  'dragOver',
  'dragStart',
  'drop',
  'focusIn',
  'focusIn',
  'focusOut',
  'focusOut',
  'input',
  'keyDown',
  'keyPress',
  'keyUp',
  'mouseDown',
  'mouseEnter',
  'mouseLeave',
  'mouseMove',
  'mouseUp',
  'submit',
  'touchCancel',
  'touchEnd',
  'touchMove',
  'touchStart',
]);
const COMPONENT_PROPS = new Set([
  'actions',
  'ariaRole',
  'attributeBindings',
  'childViews',
  'classNameBindings',
  'classNames',
  'concatenatedProperties',
  'element',
  'elementId',
  'isDestroyed',
  'isDestroying',
  'isVisible',
  'layout',
  'layoutName',
  'mergedProperties',
  'parentView',
  'positionalParams',
  'tagName',
]);

const CONTROLLER_METHODS = new Set([
  '_qpChanged',
  '_qpDelegate',
  'addObserver',
  'beginPropertyChanges',
  'cacheFor',
  'decrementProperty',
  'destroy',
  'endPropertyChanges',
  'get',
  'getProperties',
  'getWithDefault',
  'hasObserverFor',
  'incrementProperty',
  'init',
  'notifyPropertyChange',
  'removeObserver',
  'replaceRoute',
  'send',
  'set',
  'setProperties',
  'templateOnly',
  'toString',
  'toggleProperty',
  'transitionToRoute',
  'willDestroy',
]);
const CONTROLLER_PROPS = new Set([
  'actions',
  'concatenatedProperties',
  'isDestroyed',
  'isDestroying',
  'mergedProperties',
  'model',
  'queryParams',
  'target',
]);

function nodeIsSendAction(node) {
  return node.property.name === "sendAction" && node.object.type === 'ThisExpression';
}

function nodeIsSend(node) {
  return node.property.name === "send" && node.object.type === 'ThisExpression'
}

module.exports = function transformer(file, api) {
  const filePath = file.path.replace(process.cwd(), '');
  const j = api.jscodeshift;
  const ast = j(file.source);
  const classType = getClassTypeFromFilePath(filePath);
  let needsDecorator = false;

  if (!classType) {
    return;
  }

  // move props off the `actions` hash onto the parent, and wrap the value
  // of each prop with the `action` decorator.
  ast.find(j.ObjectExpression).forEach(path => {
    const actionProp = path.node.properties.find(isActionsHash);
    if (!actionProp) {
      return;
    }

    let result = processActionsHash(j, path, actionProp, filePath, classType);
    needsDecorator = result.needsDecorator;
  });

  if (classType === 'component') {
    ast.find(j.MemberExpression)
    .forEach(path => {
      if (nodeIsSendAction(path.node)) {
        
      }
    });
  } else {

  }

  // add `import { action } from '@ember/object';`
  if (needsDecorator) {
    const existingImport = ast.find(j.ImportDeclaration, {
      source: { type: 'Literal', value: '@ember/object' }
    });

    const newSpecifier = j.importSpecifier(j.identifier('action'));

    if (existingImport.length) {
      existingImport.replaceWith(path => {
        path.node.specifiers = [newSpecifier, ...path.node.specifiers];
        return path.node;
      });
    } else {
      ast.find(j.ImportDeclaration)
        .at(0)
        .insertAfter(
          j.importDeclaration([newSpecifier], j.literal('@ember/object'))
        );
    }
  }

  return ast.toSource();
};


function _checkPathForType(filePath, type) {
  let ext = path.extname(filePath);
  let modulePath = filePath;

  if (IS_EMBER_ACTION_CODEMODS_TEST) {
    modulePath = filePath.replace(`.input${ext}`, ext);
  }

  return modulePath.includes(`/${type}s/`) || modulePath.endsWith(`/${type}${ext}`);
}

function getClassTypeFromFilePath(filePath) {
  const TYPES = ['component', 'route', 'controller'];

  for (let type of TYPES) {
    if (_checkPathForType(filePath, type)) {
      return type;
    }
  }
}

function processActionsHash(j, path, actionProp, filePath, classType) {
  const remainingProps = path.node.properties.filter(p => !isActionsHash(p));
  const { propsToMove, propsToRename, propsToDelete, propsToUpgrade, propsWithConflicts } = createNewProps(
    actionProp.value.properties,
    remainingProps,
    classType,
  );
  const needsDecorator = Boolean(propsToMove.length) || Boolean(propsToUpgrade.length);
  const newProps = [];
  
  propsToMove.forEach(prop => {
    let newProp = j.property(
      'init',
      j.identifier(prop.key.name),
      j.callExpression(j.identifier('action'), [prop.value])
    );
    newProps.push(newProp);
  });
  propsToRename.forEach(prop => {
    let newProp = j.property(
      'init',
      j.identifier(`${prop.key.name}Action`),
      j.callExpression(j.identifier('action'), [prop.value])
    );
    newProps.push(newProp);
  });
  propsToUpgrade.forEach(prop => {
    let newProp = j.property(
      'init',
      j.identifier(prop.key.name),
      j.callExpression(j.identifier('action'), [prop.value])
    );
    newProps.push(newProp);
  });

  propsToDelete.forEach(prop => {
    let newProp = j.property(
      'init',
      j.identifier(prop.key.name),
      j.nullLiteral()
    );
    newProps.push(newProp);
  });

  if (propsWithConflicts.length) {
    console.log(
      chalk.grey(`⚠️ [${chalk.white(filePath)}] Could not convert ${
        chalk.white(propsWithConflicts.length)
      } properties to use the action decorator: ${chalk.white(propsWithConflicts
        .map(prop => chalk.yellow(prop.key.name))
        .join(', '))}`)
    );

    newProps.push(
      j.property(
        'init',
        j.identifier('actions'),
        j.objectExpression(propsWithConflicts)
      )
    );
  }

  path.node.properties = [...remainingProps, ...newProps];

  return { needsDecorator };
}

function isActionsHash(prop) {
  return (
    prop.key.name === 'actions' &&
    (prop.value && prop.value.type === 'ObjectExpression')
  );
}

function createNewProps(props, topLevelProps, classType) {
  const existingNames = {};
  topLevelProps.forEach(p => {
    existingNames[p.key.name] = p;
  });
  // move out of actions hash and into main definition with action decorator
  /*
  **before**
  {
    actions: {
      foo() {}
    }
  }
  **after**
  {
    foo: action(function() {})
  }
  */
  const propsToMove = [];

  // rename the action to avoid conflicts
  // the action rewriting rules for templates will similarly rewrite them
  /*
      **before**
      {
        actions: {
          set() {}
        }
      }
      **after**
      {
        setAction: action(function() {})
      }
  */
  const propsToRename = [];

  // leave in actions hash because we don't know how to handle it
  // generally this means it conflicts with a user supplied method
  // in the class
    /*
      **before**
      {
        foo() {}
        actions: {
          foo() {}
        }
      }

      **after**
      {
        foo() {}
        actions: {
          foo() {}
        }
      }
  */
  const propsWithConflicts = [];

  // discard this action as no longer necessary
  /*
  **before**
  {
    actions: {
      foo() {
        this.sendAction('foo');
      }
    }
  }
  **after**
  {
    foo: null,
  }
  */
  const propsToDelete = [];
  
  // change existing method on main definition to be an action
  // while deleting this from the action hash
  /*
  ```js
  **before**
  {
    foo() {},
    actions: {
      foo() { this.foo(); }
    }
  }
  **after**
  {
    foo: action(function() {}),
  }
  ```
  */
  const propsToUpgrade = [];

  const changes = {
    propsToMove,
    propsToRename,
    propsToDelete,
    propsToUpgrade,
    propsWithConflicts,
  }

  switch (classType) {
    case 'component':
      processChangesForComponent(props, topLevelProps, existingNames, changes);
      break;
    case 'route':
      processChangesForRoute(props, topLevelProps, existingNames, changes);
      break;
    case 'controller':
      processChangesForController(props, topLevelProps, existingNames, changes);
      break;
    default:
      throw new Error('unreachable');
  }

  return changes;
}

function processChangesForComponent(props, topLevelProps, existingNames, changes) {
  const {
    propsToMove,
    propsToRename,
    propsToDelete,
    propsToUpgrade,
    propsWithConflicts,
  } = changes;

  for (let prop of props) {
    let propName = prop.key.name;

    // handle actions that just re-call sendAction
    if (isPassThruAction(prop)) {
      propsToDelete.push(prop);
      continue;
    }
    
    if (existingNames[propName]) {
      // handle actions that just invoke the method of the same name
      if (isProxyAction(prop)) {
        propsToUpgrade.push(existingNames[propName])
      } else {
        propsWithConflicts.push(prop);
      }

      continue;
    }

    // handle actions that have the same name as a JS event
    if (COMPONENT_EVENTS.has(propName)) {
      propsToRename.push(prop);

      continue;
    }

    // handle actions that have the same name as a component method
    if (COMPONENT_METHODS.has(propName)) {
      propsToRename.push(prop);

      continue;
    }
  
    // handle actions that have the same name as a component property
    if (COMPONENT_PROPS.has(propName)) {
      propsToRename.push(prop);

      continue;
    }

    // no special casing!
    propsToMove.push(prop);
  }

}

function isPassThruAction(prop) {}

function isProxyAction(prop) {}

function processChangesForRoute(props, topLevelProps, existingNames, changes) {

}

function processChangesForController(props, topLevelProps, existingNames, changes) {

}