export function createAsyncQueue<T>() {
  let closed = false;
  const values: T[] = [];
  const waiters: Array<(v: IteratorResult<T>) => void> = [];

  const push = (value: T) => {
    if (closed) return;
    const w = waiters.shift();
    if (w) w({ value, done: false });
    else values.push(value);
  };

  const close = () => {
    if (closed) return;
    closed = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    while (waiters.length) waiters.shift()!({ value: undefined as any, done: true });
  };

  async function* iterate(): AsyncIterable<T> {
    while (true) {
      if (values.length) {
        yield values.shift()!;
        continue;
      }
      if (closed) return;

      const next = await new Promise<IteratorResult<T>>((resolve) => waiters.push(resolve));
      if (next.done) return;
      yield next.value;
    }
  }

  return { push, close, iterate };
}
