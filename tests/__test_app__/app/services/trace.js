import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class TraceService extends Service {
  @tracked
  stack = A();

  log(msg) {
    console.log(msg);
    this.stack.pushObject(msg);
  }

  @action
  clear() {
    this.stack = A();
  }
}
