#!/usr/bin/env node
import { Command } from "commander";
import { addProjects } from "./projects";
import { addProviders } from "./providers";
import { addTasks } from "./tasks";
import { addTools } from "./tools";

// Initialize the main CLI program
const program = new Command();
program.name("zeta").description("CLI wrapper around shared commands").version("1.0.0");

// Add subcommands
addProjects(program);
addProviders(program);
addTasks(program);
addTools(program);

// Parse and execute commands
void program.parseAsync().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unexpected CLI error.");
  }

  process.exit(1);
});
