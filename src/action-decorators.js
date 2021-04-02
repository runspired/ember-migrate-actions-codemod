const IS_EMBER_ACTION_CODEMODS_TEST = process.env.IS_EMBER_ACTION_CODEMODS_TEST;
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

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

function updateMetaCache(meta) {
  let filePath = path.join(process.cwd(), './actions-migration-meta.json');
  try {
    fs.lstatSync(filePath);
  } catch (e) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }
  let fileStr = fs.readFileSync(filePath, 'utf-8');
  let jsonMeta = JSON.parse(fileStr);
  jsonMeta[meta.filePath] = meta;
  fs.writeFileSync(filePath, JSON.stringify(jsonMeta, null, 2));
}

function isInternallyConsistentName(name, allProps, classType) {
  let prop = allProps.find(p => p.key.name === name);

  if (prop && propIsAction(prop, name)) {
    return true;
  }
  return false;
}

function isPotentialNameConflict(name, isUsage = false, classType = null) {
  switch (classType) {
    case 'controller':
      if (isUsage) {
        return CONTROLLER_PROPS.has(name) ||
          CONTROLLER_METHODS.has(name) ||
          ROUTE_PROPS.has(name) ||
          ROUTE_METHODS.has(name);
      }
      return CONTROLLER_PROPS.has(name) ||
        CONTROLLER_METHODS.has(name);
    case 'component':
      return ROUTE_PROPS.has(name) ||
          ROUTE_METHODS.has(name) ||
          COMPONENT_PROPS.has(name) ||
          COMPONENT_METHODS.has(name) ||
          COMPONENT_EVENTS.has(name)
    case 'route':
      return ROUTE_PROPS.has(name) ||
        ROUTE_METHODS.has(name);
    default:
      return CONTROLLER_PROPS.has(name) ||
      CONTROLLER_METHODS.has(name) ||
      COMPONENT_PROPS.has(name) ||
      COMPONENT_METHODS.has(name) ||
      COMPONENT_EVENTS.has(name) ||
      ROUTE_PROPS.has(name) ||
      ROUTE_METHODS.has(name);
  }
}

module.exports = function transformer(file, api) {
  const filePath = file.path.replace(process.cwd(), '');
  const j = api.jscodeshift;
  const ast = j(file.source);
  const classType = getClassTypeFromFilePath(filePath);
  const meta = {};
  let needsDecorator = false;
  let allProps;

  if (!classType) {
    return;
  }

  meta.filePath = filePath;
  meta.classType = classType;
  meta.usedActions = {};
  meta.declaredActions = {};

  // move props off the `actions` hash onto the parent, and wrap the value
  // of each prop with the `action` decorator.
  ast.find(j.ObjectExpression).forEach(path => {
    const actionProp = path.node.properties.find(isActionsHash);
    if (!actionProp) {
      return;
    }

    let result = processActionsHash(j, path, actionProp, filePath, classType, meta);
    needsDecorator = result.needsDecorator;
    allProps = result.allProps;
  });

  // update this.send and this.sendAction calls
  ast.find(j.CallExpression)
    .replaceWith(path => {
      if (classType === 'component' && nodeIsSendAction(path.node.callee)) {
        return replaceWithInvocation(j, path, classType, allProps, meta);
      } else if (classType !== 'component' && nodeIsSend(path.node.callee)) {
        return replaceWithInvocation(j, path, classType, allProps, meta);
      }
      return path.node;
    });

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

  updateMetaCache(meta);

  const newSourceCode = ast.toSource();
  return newSourceCode;
};

function thisExp(j, propName) {
  return j.memberExpression(j.thisExpression(), j.identifier(propName));
}

function propIsAction(p, propName) {
  return p.key.name === propName && p.kind === 'init' && p.value && p.value.callee && p.value.callee.name === 'action';
}

function replaceWithInvocation(j, path, classType, allProps, meta) {
  const args = path.node.arguments;

    if (args.length === 0) {
      return;
    }

    const [methodArg, ...callArgs] = args;

    if (!isLiteral(methodArg)) {
      console.log(`unable to replace ${path.node.callee.property.name} invocation, first arg is not a string`);
      return path.node;
    }

    let methodName = methodArg.value;
    let orgMethodName = methodName;

    // we amend anything that could be confused for
    // a route/controller/component property or method
    if (isPotentialNameConflict(methodName, true, classType) && !isInternallyConsistentName(methodName, allProps)) {
      methodName = `${methodName}Action`;
    }

    if (classType !== 'component') {
      // determine if we have an own method to invoke
      let matchedProp = allProps.find(p => propIsAction(p, methodName));
      if (matchedProp) {
        // replace send with method call
        let newNode = j.callExpression(
          thisExp(j, methodName),
          callArgs
        );
        newNode.leadingComments = path.node.leadingComments;
        newNode.trailingComments = path.node.trailingComments;
        newNode.comments = path.node.comments;
        return newNode;
      } else {
        // update send if necessary
        if (methodName !== orgMethodName) {
          methodArg.value = methodName;
        }
        meta.usedActions[methodName] = methodName;
        meta.usedActions[orgMethodName] = methodName;
        return path.node;
      }

    } else {
      // determine if we have an own method to invoke
      let matchedProp = allProps.find(p => {
        if (p.key.name === methodName && p.kind === 'init' && p.value && p.value.callee && p.value.callee.name === 'action') {
          return true;
        }
        return false;
      });
      if (!matchedProp) {
        meta.usedActions[methodName] = methodName;
        meta.usedActions[orgMethodName] = methodName;
      }

      // replace all sendAction with method calls and a guard
      let block = j.blockStatement([
        j.expressionStatement(
          j.callExpression(
            thisExp(j, methodName),
            callArgs
          )
        )
      ]);
      let newNode = j.ifStatement(
        thisExp(j, methodName),
        block,
      );
      newNode.leadingComments = path.node.leadingComments;
      newNode.trailingComments = path.node.trailingComments;
      newNode.comments = path.node.comments;

      return newNode;
    }

}

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

function processActionsHash(j, path, actionProp, filePath, classType, meta) {
  const remainingProps = path.node.properties.filter(p => !isActionsHash(p));
  const { propsToMove, propsToRename, propsToDelete, propsToUpgrade, propsWithConflicts } = createNewProps(
    j,
    actionProp.value.properties,
    remainingProps,
    classType,
  );
  const needsDecorator = Boolean(propsToRename) || Boolean(propsToMove.length) || Boolean(propsToUpgrade.length);
  const newProps = [];

  propsToMove.forEach(prop => {
    let name = prop.key.name;
    meta.declaredActions[name] = name;
    let newProp = j.property(
      'init',
      j.identifier(name),
      j.callExpression(j.identifier('action'), [prop.value])
    );
    newProp.leadingComments = prop.leadingComments;
    newProp.trailingComments = prop.trailingComments;
    newProp.comments = prop.comments;
    newProps.push(newProp);
  });
  propsToRename.forEach(prop => {
    let name = prop.key.name;
    let newName = `${name}Action`;
    meta.declaredActions[name] = newName;
    meta.declaredActions[newName] = newName;

    let newProp = j.property(
      'init',
      j.identifier(newName),
      j.callExpression(j.identifier('action'), [prop.value])
    );
    newProp.leadingComments = prop.leadingComments;
    newProp.trailingComments = prop.trailingComments;
    newProp.comments = prop.comments;
    newProps.push(newProp);
  });

  propsToUpgrade.forEach(prop => {
    let name = prop.key.name;
    meta.declaredActions[name] = name;
    let newProp = j.property(
      'init',
      j.identifier(name),
      j.callExpression(j.identifier('action'), [prop.value])
    );
    let index = remainingProps.findIndex(p => p === prop);
    newProp.leadingComments = prop.leadingComments;
    newProp.trailingComments = prop.trailingComments;
    newProp.comments = prop.comments;
    remainingProps[index] = newProp;
  });

  propsToDelete.forEach(prop => {
    let name = prop.key.name;
    if (remainingProps.find(p => p.key.name === name)) {
      return;
    }
    if (isEmptyAction(prop)) {
      return;
    }
    meta.usedActions[name] = name;
    let newProp = j.property(
      'init',
      j.identifier(name),
      j.nullLiteral()
    );
    newProps.push(newProp);
  });

  if (propsWithConflicts.length) {
    propsWithConflicts.forEach(prop => {
      let name = prop.key.name;
      meta.declaredActions[name] = name;
    });
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

  const allProps = [...remainingProps, ...newProps];
  path.node.properties = allProps;

  return { needsDecorator, allProps };
}

function isActionsHash(prop) {
  return (
    prop.key.name === 'actions' &&
    (prop.value && prop.value.type === 'ObjectExpression')
  );
}

function nodeIsSendAction(node) {
  return isThisMethod(node, 'sendAction');
}

function nodeIsSend(node) {
  return isThisMethod(node, 'send');
}

function isThisMethod(node, name) {
  return node.type === 'MemberExpression' && node.property.name === name && node.object.type === 'ThisExpression'
}

function isEmptyAction(prop) {
  return prop.value.body.body.length === 0;
}

function isPassThruAction(j, prop, classType) {
  let method = prop.value;
  let args = method.params;
  let body = method.body.body;

  if (body.length !== 1) {
    return false;
  }
  /*
    detects
    ```
    {
      foo(a) {}
      action: {
        foo(a) { this.sendAction('foo', a); }
      }
    }
    ```
  */
  let expr = body[0];
  if (expr.type !== 'ReturnStatement' && expr.type !== 'ExpressionStatement') {
    return false;
  }

  if (expr.type === 'ReturnStatement') {
    expr = expr.argument;
  } else {
    expr = expr.expression;
  }

  if (expr.type !== 'CallExpression') {
    return false;
  }

  if (classType === 'component' && !nodeIsSendAction(expr.callee)) {
    return false;
  }

  if (classType !== 'component' && !nodeIsSend(expr.callee)) {
    return false;
  }

  let callArgs = expr.arguments;
  return argsDoMatch([j.literal(prop.key.name), ...args], callArgs);
}

function isLiteral(arg) {
  return arg.type.includes('Literal');
}

function isIdentifier(arg) {
  return arg.type === 'Identifier';
}

function argsDoMatch(args1, args2) {
  if (args1.length !== args2.length) {
    return false;
  }
  for (let i = 0; i < args1.length; i++) {
    let a = args1[i];
    let b = args2[i];

    if (a.type !== b.type) {
      return false;
    }

    if (isLiteral(a)) {
      if (a.value !== b.value) {
        return false;
      }
    } else if (isIdentifier(a)) {
      if (a.name !== b.name) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

function isProxyAction(prop) {
  let method = prop.value;
  let args = method.params;
  let body = method.body.body;

  if (body.length !== 1) {
    return false;
  }
  /*
    detects
    ```
    {
      foo(a) {}
      action: {
        foo(a) { this.foo(a); }
      }
    }
    ```
  */
  let expr = body[0];
  if (expr.type !== 'ReturnStatement' && expr.type !== 'ExpressionStatement') {
    return false;
  }

  if (expr.type === 'ReturnStatement') {
    expr = expr.argument;
  } else {
    expr = expr.expression;
  }

  if (expr.type !== 'CallExpression') {
    return false;
  }

  if (!isThisMethod(expr.callee, prop.key.name)) {
    return false;
  }

  let callArgs = expr.arguments;
  return argsDoMatch(args, callArgs);
}

function createNewProps(j, props, topLevelProps, classType) {
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
      processChangesForComponent(j, props, existingNames, changes);
      break;
    case 'route':
      processChangesForRoute(j, props, existingNames, changes);
      break;
    case 'controller':
      processChangesForController(j, props, existingNames, changes);
      break;
    default:
      throw new Error('unreachable');
  }

  return changes;
}

function processChangesForComponent(j, props, existingNames, changes) {
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
    if (isPassThruAction(j, prop, 'component') || isEmptyAction(prop)) {
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

    // handle actions that have the same name as a built in method/prop/event
    if (isPotentialNameConflict(propName, false, 'component')) {
      propsToRename.push(prop);

      continue;
    }

    // no special casing!
    propsToMove.push(prop);
  }
}

function processChangesForRoute(j, props, existingNames, changes) {
  const {
    propsToMove,
    propsToRename,
    propsToDelete,
    propsToUpgrade,
    propsWithConflicts,
  } = changes;

  for (let prop of props) {
    let propName = prop.key.name;

    // handle actions that just re-call send
    if (isPassThruAction(j, prop, 'route') || isEmptyAction(prop)) {
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

    // handle actions that have the same name as a built in method/prop/event
    if (isPotentialNameConflict(propName, false, 'route')) {
      propsToRename.push(prop);

      continue;
    }

    // no special casing!
    propsToMove.push(prop);
  }
}

function processChangesForController(j, props, existingNames, changes) {
  const {
    propsToMove,
    propsToRename,
    propsToDelete,
    propsToUpgrade,
    propsWithConflicts,
  } = changes;

  for (let prop of props) {
    let propName = prop.key.name;

    // handle actions that just re-call send
    if (isPassThruAction(j, prop, 'controller') || isEmptyAction(prop)) {
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

    // handle actions that have the same name as a built in method/prop/event
    if (isPotentialNameConflict(propName, false, 'controller')) {
      propsToRename.push(prop);

      continue;
    }

    // no special casing!
    propsToMove.push(prop);
  }
}
