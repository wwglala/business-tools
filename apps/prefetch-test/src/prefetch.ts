import { prefetch, executeTask } from '@waou/prefetch';

export const task1 = () =>
  prefetch('a', 'https://www.baidu.com', { mode: 'no-cors' });
export const task2 = () =>
  prefetch('a2', 'https://www.baidu.com', { mode: 'no-cors' });

executeTask(task1, task2);
