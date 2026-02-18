#!/usr/bin/env node
import { Command } from 'commander';
import { helloWorld } from '@zeta/commands';

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

program.parse();
