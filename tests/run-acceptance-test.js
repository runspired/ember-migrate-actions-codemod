/*
  src/__test_app__ contains
  an ember application to be migrated
  with a functioning acceptance test suite.

  This script will:

  - run the tests to ensure the app is functioning
  - copy the _test_app_ into a tmp dir
  - execute the migration steps
  - run the tests again to ensure the app is still
    functioning identically

*/
const execa = require("execa");
const globby = require("globby");
const path = require("path");
const fs = require("fs");

const APP_NAME = "test-app";
const APP_LOCATION = 'src/__test_app__';
