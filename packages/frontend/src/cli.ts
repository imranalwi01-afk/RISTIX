import { Command } from 'commander';
import { run as startDev } from './scripts/ops/start-dev';
import { run as clean } from './scripts/ops/clean';

const program = new Command();

program
    .name('ops')
    .description('IFRS 9 Frontend Operations CLI')
    .version('1.0.0');

program.command('start')
    .description('Start development server (kills existing port 4231 automatically)')
    .action(startDev);

program.command('clean')
    .description('Clean build artifacts (.next, cache)')
    .option('-a, --all', 'Perform deep clean (remove node_modules)')
    .action((options) => clean(options));

program.parse();
