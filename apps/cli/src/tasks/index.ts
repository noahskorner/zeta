import { Command } from "commander";
import {
  CreateTaskCommand,
  CreateTaskFacade,
  CreateTaskRepository,
  CreateTaskService,
  ListTasksFacade,
  ListTasksRepository,
  ListTasksQuery,
  ProjectsRepository,
} from "@zeta/commands";

export function addTasks(command: Command) {
  // Instantiate services.
  const service = new CreateTaskService();
  const repository = new CreateTaskRepository();
  const facade = new CreateTaskFacade(service, repository);

  // Add the command.
  const tasksCommand = command.command("tasks").description("Manage project tasks");

  tasksCommand
    .command("add <name>")
    .description("Create a task and git worktree in a project")
    .requiredOption("--project <path>", "Project folder path")
    .requiredOption("--friendly-name <friendlyName>", "Human-friendly task name")
    .requiredOption("--description <description>", "Task description")
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
          const taskId = await facade.execute({
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
            console.error("Failed to add task.");
          }

          process.exitCode = 1;
        }
      },
    );

  tasksCommand
    .command("list <projectId>")
    .description("List tasks for a saved project")
    .action(async (projectId: string) => {
      try {
        const tasksRepository = new ListTasksRepository();
        const projectsRepository = new ProjectsRepository();
        const findTasksFacade = new ListTasksFacade(projectsRepository, tasksRepository);

        const response = await findTasksFacade.execute({
          projectId,
        } satisfies ListTasksQuery);

        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Failed to list tasks.");
        }

        process.exitCode = 1;
      }
    });
}
