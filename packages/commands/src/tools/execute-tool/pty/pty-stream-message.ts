export type PtyStreamDataMessage = {
  type: 'data';
  runId: string;
  data: string;
};

export type PtyStreamExitMessage = {
  type: 'exit';
  runId: string;
  exitCode: number;
  signal?: number;
};

export type PtyStreamMessage = PtyStreamDataMessage | PtyStreamExitMessage;
