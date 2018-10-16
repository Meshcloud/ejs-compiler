# ejsc

An opinionated ejs template compiler utility command line app.

Orchestrates compilation via [ejs](https://github.com/mde/ejs), [ejs-lint](https://github.com/RyanZim/EJS-Lint) and provides a `--watch` function via [chokidar](https://github.com/paulmillr/chokidar). Makes lodash available in ejs templates via `_`.

## Installation

```sh
npm install ejsc --global
```

## Usage

```text
ejsc [template]

Positionals:
  template  template file to compile

Options:
  --version  Show version number                                       [boolean]
  --include  include directory (globs **.ejs files)
  --watch    continuously watch template and include dir for changes
  --outFile  output file                                              [required]
  --help     Show help                                                 [boolean]
```

## Example

Compile a simple template:

```bash
$ ejsc test/simple.ejs --outFile simple
rendering test/simple.ejs: 0.729ms
```

Watching for changes contiuously (don't forget to specify `--include`):

```bash
$ ejsc test/simple.ejs --include test/include --outFile simple --watch
rendering test/simple.ejs: 0.729ms
rendering test/simple.ejs: 2.098ms
...
```

Make context data available to the template, e.g. `context.json`:

```bash
$ ejsc test/simple.ejs --context test/context.json --outFile simple
rendering test/simple.ejs: 0.729ms
```