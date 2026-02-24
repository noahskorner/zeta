import { ToolExecutionStream } from './tool-execution-stream';

export interface ExecuteToolResponse {
  toolExecutionId: string;
  stream: ToolExecutionStream;
}
