import Route from "@ember/route";

import { action } from "@ember/object";

export default Route.extend({
  actionA: null,

  // actionB: null,

  actionC: action(function(f) { console.log("in method c"); }),

  actionE() { console.log("in method e"); },

  method1() {
    this.refreshAction(this);
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

  willTransition: action(function() {
    this.a = b;
  }),

  didTransition: action(function() {
    this.c = d;
  }),

  setAction: action(function(a, b) {
    this.a = b;
  }),

  refreshAction: action(function() {
    this.refresh();
  }),

  actions: {
    actionE() {
      console.log("in action e");
    }
  }
});
