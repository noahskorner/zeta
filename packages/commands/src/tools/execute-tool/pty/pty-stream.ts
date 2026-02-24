import { PtyStreamMessage } from './pty-stream-message';

export type PtyStream = {
  id: string;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  messages: AsyncIterable<PtyStreamMessage>;
};
