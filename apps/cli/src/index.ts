#!/usr/bin/env node
import { Command } from 'commander';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  createProject,
  getDefaultProjectDataDir,
  helloWorld,
} from '@zeta/commands';

const program = new Command();

program
  .name('zeta')
  .description('CLI wrapper around shared commands')
  .version('1.0.0');

program
  .command('hello')
  .description('Print hello world from shared commands package')
  .action(() => {
    console.log(helloWorld());
  });

const projectsCommand = program
  .command('projects')
  .description('Manage saved projects');

projectsCommand
  .command('add [folderPath]')
  .description('Add a project folder to saved projects')
  .option('--path <path>', 'Project folder path')
  .action(async (folderPath: string | undefined, options: { path?: string }) => {
    const selectedPath = options.path || folderPath || (await promptForProjectPath());

    if (!selectedPath) {
      console.error('No project path provided.');
      process.exitCode = 1;
      return;
    }

    try {
      const project = await createProject({
        folderPath: selectedPath,
        dataDir: getDefaultProjectDataDir('desktop'),
      });

      console.log(`Added project "${project.name}" at ${project.folderPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Failed to add project.');
      }

      process.exitCode = 1;
    }
  });

void program.parseAsync().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unexpected CLI error.');
  }

  process.exit(1);
});

async function promptForProjectPath(): Promise<string | null> {
  const readline = createInterface({ input, output });

  try {
    const answer = await readline.question('Project folder path: ');
    const trimmedAnswer = answer.trim();
    return trimmedAnswer ? trimmedAnswer : null;
  } finally {
    readline.close();
  }
}
