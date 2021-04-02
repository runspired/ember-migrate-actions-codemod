import Component from "@ember/component";

export default Component.extend({
  actionA: null,
  // actionB: null,

  actionC(f) { console.log("in method c"); },

  actionE() { console.log("in method e"); },

  method1() {
    this.sendAction("actionA", 2);
    this.sendAction("didInsertElement", this);
  },

  method2(b, c) {
    this.a = b;
    this.sendAction("actionC", b + c);
    this[a] = c;
  },

  actions: {
    actionA() {
      this.sendAction("actionA");
    },
    actionB(f) {
      this.sendAction("actionB", f);
    },
    actionC(f) {
      this.actionC(f);
    },

    // this action will move
    actionD() {
      console.log("in action d");
    },

    actionE() {
      console.log("in action e");
    },
    actionF() {
      this.sendAction("actionA", 1, 2, 3);
    },
    actionG() {
        // this action wil be deleted
    },
    set(a, b) {
      this.a = b;
    }
  }
});
