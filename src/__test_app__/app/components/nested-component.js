import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  trace: inject(),
  actions: {
    refresh(msg) {
      this.trace.log(`component/nested-component#refresh :: ${msg}`);
      this.sendAction('refresh', msg);
    },
    update(msg) {
      this.trace.log(`component/nested-component#update :: ${msg}`);
      this.count++;
    }
  }
});
