// raf polyfill - https://reactjs.org/docs/javascript-environment-requirements.html
import 'raf/polyfill';
import enzyme, { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import { mountWithIntl, shallowWithIntl } from './intl-enzyme-test-helper';

window.$ = require('jquery');
window.jQuery = require('jquery');

console.error = (message) => { // eslint-disable-line no-console
  if (!/(React.createElement: type should not be null)/.test(message)) {
    throw new Error(message);
  }
};

// React 16 Enzyme adapter
configure({ adapter: new Adapter() });

global.mount = enzyme.mount;
global.render = enzyme.render;
global.shallow = enzyme.shallow;
global.toJson = toJson;
global.mountWithIntl = mountWithIntl;
global.shallowWithIntl = shallowWithIntl;

const htmlTag = document.getElementsByTagName('html')[0];
htmlTag.setAttribute('dir', 'ltr');
