import { PtyStream } from './pty/pty-stream';

export interface ExecuteToolResponse {
  toolExecutionId: string;
  stream: PtyStream;
}
