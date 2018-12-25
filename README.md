# redux-semaphore

Ever wanted to wait for some action to happen in redux? `redux-semaphore` is yet another way to do it.


## Usage

Obviously, first thing you need to do is to install it:

`npm install --save redux-semaphore`

Then, in your store configuration script, you need to create and use semaphore middleware:

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createSemaphoreMiddleware } from 'redux-semaphore';

import reducer from './reducers';

// Create middleware
// For now middleware factory doesn't take any parameters 
const semaphoreMiddleware = createSemaphoreMiddleware();

export const store = createStore(
  reducer,
  applyMiddleware(semaphoreMiddleware)
);
```

And finally, somewhere in your code, you can do this:

```javascript
import {
  INITIAL_PROCESS_ACTION,
  TERMINAL_PROCESS_ACTION,
  TERMINAL_PROCESS_ACTION_2,
  // ...
} from './constants/actionTypes';
import { semaphore } from 'redux-semaphore';

// You don't have to use async/await.
// Good ol' semaphore().then will work too
async function theProcess() {
  // Start some async process by firing initial action
  // It can be some saga, or whatever you want
  store.dispatch({ type: INITIAL_PROCESS_ACTION });

  // Wait for terminal action to be dispatched
  const terminalAction = await semaphore(TERMINAL_PROCESS_ACTION);

  // Wait for one of terminal actions in the list to be dispatched
  const terminalAction = await semaphore([
    TERMINAL_PROCESS_ACTION,
    TERMINAL_PROCESS_ACTION_2,
  ]);

  // Also you can pass a function to check actions
  const terminalAction = await semaphore(action => {
    return action.type === TERMINAL_PROCESS_ACTION && action.transactionId === transactionId;
  });

  // Furthermore, if you want for a semaphore to fail, you can pass
  // a second action checker
  try {
    store.dispatch({ type: INITIAL_PROCESS_ACTION });    
    const success = await semaphore(PROCESS_SUCCESS_ACTION, PROCESS_FAIL_ACTION);
  } catch (error) {
    console.warn('Process failed with error: ' + error);
  }

  // Also composition goodies from native Promise class will work
  const result = await Promise.race([
    semaphore(TERMINAL_PROCESS_ACTION),
    semaphore(PROCESS_CANCEL_ACTION),
  ]);
}
```

And that's about it. Nothing special here. Open `index.js` and see for yourself.


## Motivation

Original intention for this lib was to get some way to wait until some saga finishes.
Given examples above, those who are familiar with `redux-saga`, already noticed that in fact,
`await semaphore(action)` is a "lite" version of `yield take(action)` in sagas.


## License

Copyright (c) 2018 Danila Shutov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
