import Component from "@ember/component";
import { action } from "@ember/object";
import { A } from "@ember/array";

export default Component.extends({
  foo: A([]),
  b: action(function() {}),
  actions: {
    bar() {
      console.log("something");
    },
  }
});
