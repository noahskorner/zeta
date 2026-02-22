import { ListToolsQuery } from './list-tools.query';
import { ListToolResponse, ListToolsResponse } from './list-tools.response';
import { ListToolsRepository } from './list-tools.repository';

export class ListToolsFacade {
  constructor(private _repository: ListToolsRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(query?: ListToolsQuery): Promise<ListToolsResponse> {
    // Load persisted tools from app data.
    const tools = await this._repository.findAllTools();

    // Return a stable response contract for consumers.
    return {
      tools: tools.map(
        (tool) =>
          ({
            id: tool.id,
            name: tool.name,
            command: tool.command,
            args: tool.args,
            createdAt: tool.createdAt,
          }) satisfies ListToolResponse,
      ),
    } satisfies ListToolsResponse;
  }
}
