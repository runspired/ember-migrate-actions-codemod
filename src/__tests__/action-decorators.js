process.env.IS_EMBER_ACTION_CODEMODS_TEST = true;
const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, 'action-decorators', null, 'action-decorators/app/components/simple');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/app/components/add-import');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/app/components/conflicts');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/app/components/conflicts-ember');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/app/components/multiple-imports');
// defineTest(__dirname, 'action-decorators', null, 'action-decorators/app/components/complex');
