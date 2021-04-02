process.env.IS_EMBER_ACTION_CODEMODS_TEST = true;
const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/components/simple');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/components/add-import');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/components/conflicts');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/components/conflicts-ember');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/components/multiple-imports');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/components/complex');

defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/controllers/complex');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/controllers/complex2');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/routes/complex');

defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/pods/foo/bar/component');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/pods/foo/bar/route');
defineTest(__dirname, '../src/action-decorators', null, 'action-decorators/app/pods/foo/bar/controller');
