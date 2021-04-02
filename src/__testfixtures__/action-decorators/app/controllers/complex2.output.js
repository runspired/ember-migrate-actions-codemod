import Controller from "@ember/controller";

import { action } from "@ember/object";

export default Controller.extend({
  actionA: null,

  // actionB: null,

  actionC: action(function(f) { console.log("in method c"); }),

  actionE() { console.log("in method e"); },

  method1() {
    this.send("refreshAction", this);
  },

  actionB: action(function(f) {
    this.send("actionA", f);
  }),

  // this action will move
  actionD: action(function() {
    // this will be converted
    this.actionC(1, 2, 3);
    console.log("in action d");
  }),

  setAction: action(function(a, b) {
    this.a = b;
  }),

  actions: {
    actionE() {
      console.log("in action e");
    }
  }
});
