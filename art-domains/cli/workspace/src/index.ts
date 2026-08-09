#!/usr/bin/env node

import { Command } from 'commander'

const program = new Command()

program
  .name('art-workspace')
  .description('Workspace orchestration CLI')
  .version('0.0.1')

program
  .command('clone')
  .description('Clone repos from manifest')
  .action(() => {
    console.log('clone command - TODO')
  })

program
  .command('branch')
  .description('Branch across repos')
  .action(() => {
    console.log('branch command - TODO')
  })

program
  .command('link')
  .description('Link packages for local dev')
  .action(() => {
    console.log('link command - TODO')
  })

program
  .command('sanity')
  .description('Check repo status')
  .action(() => {
    console.log('sanity command - TODO')
  })

program
  .command('publish')
  .description('Publish packages')
  .action(() => {
    console.log('publish command - TODO')
  })

program.parse()
