import { ToolEntity } from '../tool.entity';
import { ToolsRepository } from '../tools.repository';

export class ListToolsRepository extends ToolsRepository {
  public async findAllTools(): Promise<ToolEntity[]> {
    return this.findAll();
  }
}
