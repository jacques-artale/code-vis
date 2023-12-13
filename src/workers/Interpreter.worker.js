/* eslint-disable no-restricted-globals */
import { ModuleTester } from '../modules/ModuleTester';

self.addEventListener('message', (e) => {
  console.log('Message received from main script:', e.data);

  const tester = new ModuleTester();
  console.log(tester.test());

  self.postMessage('Received: ' + e.data);
});
