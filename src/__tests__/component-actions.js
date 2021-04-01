const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, 'component-actions', null, 'component-actions/simple');
defineTest(__dirname, 'component-actions', null, 'component-actions/add-import');
defineTest(__dirname, 'component-actions', null, 'component-actions/conflicts');
defineTest(__dirname, 'component-actions', null, 'component-actions/conflicts-ember');
defineTest(__dirname, 'component-actions', null, 'component-actions/multiple-imports');
