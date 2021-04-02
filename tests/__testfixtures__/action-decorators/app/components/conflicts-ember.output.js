import Component from "@ember/component";

import { action } from "@ember/object";

export default Component.extends({
  didInsertElementAction: action(function() {
    console.log("something");
  })
});
