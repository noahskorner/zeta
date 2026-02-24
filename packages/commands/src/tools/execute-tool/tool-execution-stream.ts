import {
  ToolExecutionStreamExitMessage,
  ToolExecutionStreamMessage,
} from './tool-execution-stream-message';

export type ToolExecutionStream = {
  id: string;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  onExit: Promise<ToolExecutionStreamExitMessage>;
  messages: AsyncIterable<ToolExecutionStreamMessage>;
};
