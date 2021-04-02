import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class TraceService extends Service {
  @tracked
  stack = A();

  log(msg) {
    this.stack.pushObject(msg);
  }

  clear() {
    this.stack = A();
  }
}
