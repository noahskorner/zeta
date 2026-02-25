import { Command } from 'commander';
import {
  CreateTaskCommand,
  CreateTaskFacade,
  CreateTaskRepository,
  CreateTaskService,
  ListTasksFacade,
  ListTasksRepository,
  ListTasksQuery,
  ProjectsRepository,
  UpdateTaskCommand,
  UpdateTaskFacade,
  UpdateTaskRepository,
  UpdateTaskService,
} from '@zeta/commands';

export function addTasks(command: Command) {
  // Instantiate services.
  const createTaskService = new CreateTaskService();
  const createTaskRepository = new CreateTaskRepository();
  const createTaskFacade = new CreateTaskFacade(createTaskService, createTaskRepository);

  const projectsRepository = new ProjectsRepository();
  const listTasksRepository = new ListTasksRepository();
  const listTasksFacade = new ListTasksFacade(projectsRepository, listTasksRepository);

  const updateTaskService = new UpdateTaskService();
  const updateTaskRepository = new UpdateTaskRepository();
  const updateTaskFacade = new UpdateTaskFacade(updateTaskService, updateTaskRepository);

  // Add the command.
  const tasksCommand = command.command('tasks').description('Manage project tasks');

  tasksCommand
    .command('add <name>')
    .description('Create a task and git worktree in a project')
    .requiredOption('--project <path>', 'Project folder path')
    .requiredOption('--friendly-name <friendlyName>', 'Human-friendly task name')
    .requiredOption('--description <description>', 'Task description')
    .action(
      async (
        name: string,
        options: {
          project: string;
          friendlyName: string;
          description: string;
        },
      ) => {
        try {
          const taskId = await createTaskFacade.execute({
            projectPath: options.project,
            name,
            friendlyName: options.friendlyName,
            description: options.description,
          } satisfies CreateTaskCommand);

          console.log(`Successfully created task: ${taskId}`);
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error('Failed to add task.');
          }

          process.exitCode = 1;
        }
      },
    );

  tasksCommand
    .command('list <projectId>')
    .description('List tasks for a saved project')
    .action(async (projectId: string) => {
      try {
        const response = await listTasksFacade.execute({
          projectId,
        } satisfies ListTasksQuery);

        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Failed to list tasks.');
        }

        process.exitCode = 1;
      }
    });

  tasksCommand
    .command('update <taskId>')
    .description("Update a task's metadata in a project")
    .requiredOption('--project <path>', 'Project folder path')
    .option('--friendly-name <friendlyName>', 'Updated human-friendly task name')
    .option('--description <description>', 'Updated task description')
    .action(
      async (
        taskId: string,
        options: {
          project: string;
          friendlyName?: string;
          description?: string;
        },
      ) => {
        try {
          const response = await updateTaskFacade.execute({
            projectPath: options.project,
            taskId,
            friendlyName: options.friendlyName,
            description: options.description,
          } satisfies UpdateTaskCommand);

          console.log(JSON.stringify(response, null, 2));
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error('Failed to update task.');
          }

          process.exitCode = 1;
        }
      },
    );
}
