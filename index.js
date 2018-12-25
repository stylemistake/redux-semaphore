/**
 * Copyright (c) 2018 Danila Shutov
 * SPDX-License-Identifier: MIT
 */

const semaphores = new Set();

export function createSemaphoreMiddleware() {
  return store => next => action => {
    for (let semaphore of semaphores) {
      semaphore(action);
    }
    return next(action);
  };
}

function normalizePattern(pattern) {
  // Match an exact action type
  if (typeof pattern === 'string') {
    return action => action.type === pattern;
  }
  // Match an array of action types
  if (Array.isArray(pattern)) {
    return action => pattern.includes(action.type);
  }
  // Match by user-provided function
  return pattern;
}

const PATTERN_ANY = () => true;
const PATTERN_NONE = () => false;

export function semaphore(resolvePattern, rejectPattern) {
  const resolveOn = normalizePattern(resolvePattern) || PATTERN_ANY;
  const rejectOn = normalizePattern(rejectPattern) || PATTERN_NONE;
  let semaphoreInstance;
  return (new Promise((resolve, reject) => {
    semaphoreInstance = action => {
      if (rejectOn(action)) {
        reject(action);
      }
      else if (resolveOn(action)) {
        resolve(action);
      }
    };
    semaphores.add(semaphoreInstance);
  }))
    .then(action => {
      semaphores.delete(semaphoreInstance);
      return action;
    })
    .catch(error => {
      semaphores.delete(semaphoreInstance);
      return Promise.reject(error);
    });
}
