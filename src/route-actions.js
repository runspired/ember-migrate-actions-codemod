module.exports = function transformer(file, api) {
    const j = api.jscodeshift;
    const ast = j(file.source);
  
    let needsDecorator = false;
  
    // move props off the `actions` hash onto the parent, and wrap the value
    // of each prop with the `action` decorator.
    ast.find(j.ObjectExpression).replaceWith(path => {
      const actionProp = path.node.properties.find(isActionsHash);
      if (!actionProp) {
        return path.node;
      }
  
      const remainingProps = path.node.properties.filter(p => !isActionsHash(p));
  
      const [propsToConvert, propsWithConflicts] = createNewProps(
        actionProp.value.properties,
        remainingProps.map(prop => prop.key.name)
      );
  
      needsDecorator = Boolean(propsToConvert.length);
  
      const newProps = propsToConvert.map(prop => {
        return j.property(
          'init',
          j.identifier(prop.key.name),
          j.callExpression(j.identifier('action'), [prop.value])
        );
      });
  
      if (propsWithConflicts.length) {
        console.log(
          `[${file.path}] Could not convert ${
            propsWithConflicts.length
          } properties to use the action decorator: ${propsWithConflicts
            .map(prop => prop.key.name)
            .join(', ')}`
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
        ast
          .find(j.ImportDeclaration)
          .at(0)
          .insertAfter(
            j.importDeclaration([newSpecifier], j.literal('@ember/object'))
          );
      }
    }
  
    return ast.toSource({ quote: 'single' });
  };
  
  function isActionsHash(prop) {
    return (
      prop.key.name === 'actions' &&
      (prop.value && prop.value.type === 'ObjectExpression')
    );
  }
  
  const EMBER_COMPONENT_METHODS = new Set([  
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
  
    // properties
    _activeQPChanged
    _names
    _optionsForQueryParam
    _qp
    actions
    concatenatedProperties
    controller
    controllerName
    fullRouteName
    isDestroyed
    isDestroying
    mergedProperties
    queryParams
    routeName
    store
    templateName
    
    // events
    activate
    deactivate
    didTransition
    error
    loading
    willTransition
  ]);
  
  function createNewProps(properties, existingNames) {
    const newProps = [];
    const propsWithConflicts = [];
  
    properties.forEach(prop => {
      if (
        existingNames.includes(prop.key.name) ||
        EMBER_COMPONENT_METHODS.has(prop.key.name)
      ) {
        propsWithConflicts.push(prop);
      } else {
        newProps.push(prop);
      }
    });
  
    return [newProps, propsWithConflicts];
  }
  