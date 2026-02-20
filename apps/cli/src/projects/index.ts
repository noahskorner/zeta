import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  CreateProjectCommand,
  CreateProjectFacade,
  CreateProjectRepository,
  CreateProjectService,
} from "@zeta/commands";

export function addProjects(command: Command) {
  // Instantiate services
  const service = new CreateProjectService();
  const repository = new CreateProjectRepository();
  const facade = new CreateProjectFacade(service, repository);

  // Add the command
  const projectsCommand = command
    .command("projects")
    .description("Manage saved projects");

  projectsCommand
    .command("add [folderPath]")
    .description("Add a project folder to saved projects")
    .option("--path <path>", "Project folder path")
    .action(
      async (folderPath: string | undefined, options: { path?: string }) => {
        // Prompt for the project path if not provided as an argument or option
        const selectedPath =
          options.path || folderPath || (await promptForProjectPath());

        if (!selectedPath) {
          console.error("No project path provided.");
          process.exitCode = 1;
          return;
        }

        try {
          // Create the project
          await facade.execute({
            folderPath: selectedPath,
          } satisfies CreateProjectCommand);

          console.log(`Successfully created project 🚀`);
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("Failed to add project.");
          }

          process.exitCode = 1;
        }
      },
    );
}

async function promptForProjectPath(): Promise<string | null> {
  const readline = createInterface({ input, output });

  try {
    const answer = await readline.question("Project folder path: ");
    const trimmedAnswer = answer.trim();
    return trimmedAnswer ? trimmedAnswer : null;
  } finally {
    readline.close();
  }
}
