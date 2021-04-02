import Controller from "@ember/controller";

export default Controller.extend({
  actionA: null,

  // actionB: null,

  actionC(f) { console.log("in method c"); },

  actionE() { console.log("in method e"); },

  method1() {
    this.send("refresh", this);
  },

  actions: {
    actionA() {
      // circular should be deleted
      this.send("actionA");
    },
    actionB(f) {
      this.send("actionA", f);
    },
    actionC(f) {
      // will be removed and actionC upgraded
      this.actionC(f);
    },

    // this action will move
    actionD() {
      // this will be converted
      this.send("actionC", 1, 2, 3);
      console.log("in action d");
    },

    actionE() {
      console.log("in action e");
    },
    actionG() {
        // this action wil be deleted
    },
    set(a, b) {
      this.a = b;
    },
  }
});
