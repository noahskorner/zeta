export type ToolExecutionStreamDataMessage = {
  type: 'data';
  runId: string;
  data: string;
};

export type ToolExecutionStreamExitMessage = {
  type: 'exit';
  runId: string;
  exitCode: number;
  signal?: number;
};

export type ToolExecutionStreamMessage =
  | ToolExecutionStreamDataMessage
  | ToolExecutionStreamExitMessage;
