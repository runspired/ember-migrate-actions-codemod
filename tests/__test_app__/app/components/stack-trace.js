import Component from '@glimmer/component';
import { inject } from '@ember/service';

export default class StackTraceComponent extends Component {
  @inject trace;
}
