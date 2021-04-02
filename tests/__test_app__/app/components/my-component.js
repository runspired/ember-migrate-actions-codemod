import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  trace: inject(),
  actions: {
    didInsertElement(msg) {
      this.trace.log(`component/my-component#didInsertElement :: ${msg}`);
      this.sendAction('refresh', msg);
    },
    refresh(msg) {
      this.trace.log(`component/my-component#refresh :: ${msg}`);
      this.sendAction('refresh', msg);
    }
  }
});
