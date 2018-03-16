const semaphores = new Set();

export function createSemaphoreMiddleware() {
  return ({ dispatch, getState }) => {
    return next => action => {
      for (let semaphore of semaphores) semaphore(action);
      return next(action);
    };
  }
}

function normalizePattern(pattern) {
  return typeof pattern === 'string'
    ? (action) => action.type === pattern
    : pattern;
}

export function semaphore(resolvePattern, rejectPattern) {
  const resolveOn = normalizePattern(resolvePattern);
  const rejectOn = normalizePattern(rejectPattern);
  let semaphoreInstance;
  return (new Promise((resolve, reject) => {
    semaphoreInstance = (action) => {
      if (resolveOn(action)) resolve(action);
      else if (rejectOn && rejectOn(action)) reject(action);
    };
    semaphores.add(semaphoreInstance);
  })).then(() => semaphores.delete(semaphoreInstance));
}
