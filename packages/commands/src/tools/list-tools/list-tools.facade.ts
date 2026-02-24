import { ListToolsQuery } from './list-tools.query';
import { resolveToolExecutable } from '../resolve-tool-executable';
import { ListToolResponse, ListToolsResponse } from './list-tools.response';
import { ListToolsRepository } from './list-tools.repository';

export class ListToolsFacade {
  constructor(private _repository: ListToolsRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(query?: ListToolsQuery): Promise<ListToolsResponse> {
    // Load persisted tools from app data.
    const tools = await this._repository.findAllTools();
    const resolutions = await Promise.all(tools.map((tool) => resolveToolExecutable(tool.exec)));

    // Return a stable response contract for consumers.
    return {
      tools: tools.map(
        (tool, index) =>
          ({
            id: tool.id,
            name: tool.name,
            exec: tool.exec,
            args: tool.args,
            interactive: tool.interactive,
            status: resolutions[index].status,
            resolvedExec:
              resolutions[index].status === 'ready' ? resolutions[index].resolvedExec : undefined,
            createdAt: tool.createdAt,
          }) satisfies ListToolResponse,
      ),
    } satisfies ListToolsResponse;
  }
}
