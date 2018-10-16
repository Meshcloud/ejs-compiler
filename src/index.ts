import * as fs from 'fs';
import * as _ from 'lodash';
import * as ejs from 'ejs';
import * as chokidar from 'chokidar';
import * as ejsLint from 'ejs-lint';

import * as yargs from 'yargs';
import { Arguments } from 'yargs';

function render(templateFile: string, outFile: string) {
  const tag = `rendering ${templateFile}`;
  const options = {};

  const ejsContext = {
    _: _ // inject lodash
  };

  try {
    console.time(tag);
    ejs.clearCache(); // clear ejs caches (e.g. for include files)

    ejs.renderFile(templateFile, ejsContext, options, function (err, str) {
      console.timeEnd(tag);
      if (err) {
        console.error(err);
        const text = fs.readFileSync(templateFile, 'utf-8');
        const lintError = ejsLint(text, options);
        console.error(lintError);

        return;
      }

      fs.writeFileSync(outFile, str);
    });
  } catch (error) {
    console.error(error);
  }
}

function setupWatcher(path, cb) {
  const options = {
    awaitWriteFinish: { // wait for the file contents to be fully written to disk before loading it
      stabilityThreshold: 200,
      pollInterval: 40
    }
  };

  chokidar
    .watch(path, options)
    .on('all', (event) => {
      if (event !== 'change') {
        return;
      }

      cb();
    });
}

function main(args) {
  const r = () => render(args.template, args.outFile);

  // render a first pass
  r();

  // setup watchers
  if (args.watch) {
    setupWatcher(args.template, r);
    if (args.include) {
      setupWatcher(`${args.include}/**.ejs`, r);
    }
  }
}

yargs
  .command(
    '* [template]',
    false,
    (y: yargs.Argv) => y.positional('template', { describe: 'template file to compile' }),
    (args: Arguments) => main(args)
  )
  .options({
    include: {
      describe: 'include directory (globs **.ejs files)',
      demand: false
    },
    watch: {
      describe: 'continuously watch template and include dir for changes',
      demand: false
    },
    outFile: {
      describe: 'output file',
      demand: true
    }
  });


// tslint:disable-next-line:no-unused-expression
yargs.help().argv;

