import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  trace: inject(),
  actions: {
    refreshModel(msg) {
      this.trace.log(`controller/application#refreshModel :: ${msg}`);
      this.send('refresh', msg);
    },
    select(msg) {
      this.trace.log(`controller/application#select :: ${msg}`);
      this.send('updateModel', msg);
    },
    change(msg) {
      this.trace.log(`controller/application#change :: ${msg}`);
    }
  }
});
