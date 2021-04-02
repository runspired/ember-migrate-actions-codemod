import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  trace: inject(),
  selectAll: null,
  actions: {
    refreshModel(msg) {
      this.trace.log(`component/scoped-component#refreshModel :: ${msg}`);
      this.sendAction('refresh', msg);
    }
  }
});
