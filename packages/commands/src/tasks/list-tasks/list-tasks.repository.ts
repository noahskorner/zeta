import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { TaskEntity } from '../task.entity';

export class ListTasksRepository {
  public async findAll(projectPath: string): Promise<TaskEntity[]> {
    const tasksFilePath = path.join(projectPath, '.zeta', 'tasks.json');

    try {
      const raw = await readFile(tasksFilePath, 'utf8');
      const parsed = JSON.parse(raw) as TaskEntity[];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((task) => {
        return (
          typeof task?.id === 'string' &&
          typeof task?.slug === 'string' &&
          typeof task?.title === 'string' &&
          typeof task?.description === 'string' &&
          typeof task?.createdAt === 'string'
        );
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }
}
