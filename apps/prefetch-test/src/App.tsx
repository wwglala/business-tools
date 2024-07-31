import { prefetch } from '@waou/prefetch';

export function App() {
  const onClick = () => {
    prefetch('a', 'https://www.baidu.com', { mode: 'no-cors' }).then(
      console.log
    );
  };

  return (
    <div>
      <button onClick={onClick}>consumed</button>
    </div>
  );
}
