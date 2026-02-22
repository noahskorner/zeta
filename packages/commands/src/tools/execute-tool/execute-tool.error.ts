export class ExecuteToolError extends Error {
  public readonly code = 'TOOL_EXECUTION_FAILED';

  constructor(
    message: string,
    public readonly toolId: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ExecuteToolError';
  }
}
