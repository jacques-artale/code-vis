/* eslint-disable no-restricted-globals */

export default () => {
  self.addEventListener('message', (e) => {
    console.log('Message received from main script:', e.data);
  
    self.postMessage('Received: ' + e.data);
  });
}
