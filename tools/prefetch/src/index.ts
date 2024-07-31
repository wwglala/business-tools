export const PREFETCH_KEY = Symbol.for('__business_tools_prefetch_cache__');

export const prefetch = async (
  id: string,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (!window[PREFETCH_KEY]) {
    window[PREFETCH_KEY] = {};
  }

  const prefetchCache = window[PREFETCH_KEY][id];

  /**
   * ’null‘ means it has been consumed
   * so the next fetch, should use user request instance
   */
  if (prefetchCache === null) {
    return Promise.reject(null);
  }

  if (prefetchCache) {
    /**
     * when it used, The null flag was consumed
     */
    window[PREFETCH_KEY][id] = null;
    return prefetchCache;
  }

  const resPromise = fetch(input, init);

  window[PREFETCH_KEY][id] = resPromise;

  return resPromise;
};

export const executeTask = async (..._tasks: (() => void)[]) => {
  const tasks = _tasks.filter((task) => task && typeof task === 'function');

  Promise.all(tasks.map((task) => task()));
};
