import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
  trace: inject(),
  actions: {
    refresh(msg) {
      this.trace.log(`route/application#refresh :: ${msg}`);
      this.refresh()
    },
    didTransition() {
      this.trace.log(`route/application#didTransition`);
    },
    updateModel(msg) {
      this.trace.log(`route/application#updateModel :: ${msg}`);
    }
  }
});
