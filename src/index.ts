#!/usr/bin/env node

import * as fs from 'fs';
import * as _ from 'lodash';
import * as ejs from 'ejs';
import * as chokidar from 'chokidar';
import * as ejsLint from 'ejs-lint';

import * as yargs from 'yargs';
import { Arguments } from 'yargs';

function render(templateFile: string, outFile: string, userContext: {}) {
  const tag = `rendering ${templateFile}`;
  const options = {};

  const lodashContext = {
    _: _ // inject lodash
  };

  const ejsContext = Object.assign({}, userContext || {}, lodashContext);

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
  let context = {};
  if (args.context) {
    const content = fs.readFileSync(args.context, 'utf-8');
    context = JSON.parse(content);
  }

  const r = () => render(args.template, args.outFile, context);

  // render a first pass
  r();

  // setup watchers
  if (args.watch) {
    setupWatcher(args.template, r);
    if (args.include) {
      setupWatcher(`${args.include}/**.ejs`, r);
    }
    if (args.context) {
      setupWatcher(args.context, r);
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
      describe: 'path to include directory (globs **.ejs files)',
      demand: false
    },
    watch: {
      describe: 'continuously watch template and include dir for changes',
      demand: false
    },
    context: {
      describe: 'path to a json file with context data available in the template',
      demand: false
    },
    outFile: {
      describe: 'path to output file',
      demand: true
    }
  });


// tslint:disable-next-line:no-unused-expression
yargs.help().argv;

