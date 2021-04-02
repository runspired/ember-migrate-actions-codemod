import Component from "@ember/component";

export default Component.extend({
    actionA: null,
    // actionB: null,
    actionB: null,

    actionC: action(function(f) { console.log("in method c"); }),

    actionD: action(function() { console.log("in action d"); }),

    actionF: action(function() {
        if (this.actionA) {
            this.actionA(1, 2, 3);
        }
    }),

    method1() {
        if (this.actionA) {
            this.actionA(2);
        }
    },
  
    method2(b, c) {
        this.a = b;
        if (this.actionC) {
            this.actionC(b + c);
        }
        this.a = c;
    },

    setAction: action(function(a, b) {
      this.a = b;
    }),

    actions: {
        actionE() {
            console.log("in action e");
        }
    }
});