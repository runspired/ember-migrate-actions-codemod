import Component from "@ember/component";

import { action } from "@ember/object";

export default Component.extend({
  actionA: null,

  // actionB: null,

  actionC: action(function(f) { console.log("in method c"); }),

  actionE() { console.log("in method e"); },

  method1() {
    if (this.actionA) {
      this.actionA(2);
    };
    if (this.didInsertElementAction) {
      this.didInsertElementAction(this);
    };
  },

  method2(b, c) {
    this.a = b;
    if (this.actionC) {
      this.actionC(b + c);
    };
    this[a] = c;
  },

  // this action will move
  actionD: action(function() {
    console.log("in action d");
  }),

  actionF: action(function() {
    if (this.actionA) {
      this.actionA(1, 2, 3);
    };
  }),

  setAction: action(function(a, b) {
    this.a = b;
  }),

  actionB: null,

  actions: {
    actionE() {
      console.log("in action e");
    }
  }
});
