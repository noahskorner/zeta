import { Command } from "commander";
import {
  CreateTaskCommand,
  CreateTaskFacade,
  CreateTaskRepository,
  CreateTaskService,
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
}
