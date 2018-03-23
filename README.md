# redux-semaphore

Ever wanted to wait for some action to happen in redux? `redux-semaphore` is yet another way to do it.

### Usage

Obviously, first thing you need to do is to install it:

`npm install --save redux-semaphore`

Then, in your store configuration script, you need to create and use semaphore middleware:

```javascript
import {createStore, applyMiddleware} from 'redux';
import {createSemaphoreMiddleware} from 'redux-semaphore';

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
    TERMINAL_PROCESS_ACTION
    // ...
} from './constants/actionTypes';
import {semaphore} from 'redux-semaphore';

// You don't have to use async/await.
// Good ol' semaphore().then will work too
async function theProcess() {
    // Start some async process by firing initial action
    // It can be some saga, or whatever you want
    store.dispatch({ type: INITIAL_PROCESS_ACTION });

    // Wait for terminal action to be dispatched
    const terminalAction = await semaphore(TERMINAL_PROCESS_ACTION);

    // Also you can pass a function to check actions
    const terminalAction = await semaphore(action => {
        return action.type === TERMINAL_PROCESS_ACTION && action.transactionId === transactionId;
    });

    // Furthermore, if you want for semaphore to fail, you can pass second action checker
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

### Motivation

Original intention for this lib was to get some way to wait until some saga finishes.
Given examples above, those who are familiar with `redux-saga`, already noticed that in fact,
`await semaphore(action)` is a "lite" version of `yield take(action)` in sagas.