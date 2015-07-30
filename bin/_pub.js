#!/usr/bin/env node

/*
 * pub command script
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 */

var pkg = require('../package.json');
console.log(pkg.name, 'v'+pkg.version);

// https://github.com/tj/commander.js
var cli = require('commander');

cli.unknownOption = function(opt) {
  process.stdout.write('\n  unknown option: ' + opt + '\n' + cli.helpInformation());
  process.exit(1);
}

// tweak usage not to include the first line with the incorrect command name
cli.helpInformation = function() { return '\n' +
  'usage: pub [opts] [dir]\n' +
  'opts:\n' +
  cli.optionHelp().replace(/^/gm, '  ') + '\n\n';
}

var u = require('pub-util');

cli
  .option('-p, --port <port>',       'server port [3001]')
  .option('-t, --theme <name>',      'theme module-name or dir, repeatable', collect, [])
  .option('-o, --output-path <dir>', 'output dir [./out]')
  .option('-O, --output-only',       'output html, scripts, static files and exit')
  .option('-G, --html-only',         'output generated html files and exit')
  .option('-r, --relpaths',          'output with relative paths')
  .option('-s, --static <dir>',      'static dir, repeatable, supports <dir>,<route>', collectStaticPaths, [])
  .option('-S, --static-only <dir>', 'serve only static files from <dir>', collectStaticPaths, [])
  .option('-m, --md-fragments',      'use markdown headers as fragments')
  .option('-C, --config',            'show config and exit')
  .option('-I, --ignore-config',     'ignore pub-config file')
  .option('-P, --pages',             'show pages and templates and exit')
  .option('-W, --no-watch',          'don\'t watch for changes')
  .option('-K, --no-sockets',        'no websockets')
  .option('-E, --no-editor',         'website only, no editor')
  .option('-d, --dbg',               'enable scriptmaps and client-side debug traces')
  .option('-D, --debug',             'node --debug (server and client-side)')
  .option('-B, --debug-brk',         'node --debug-brk (server and client-side)');

cli.parse(process.argv);

var opts = {};

opts.cli = true;
opts.dir = cli.args[0] || '.';

if (cli.port)                      { opts.port = cli.port; }
if (cli.theme.length)              { opts.pkgs = cli.theme; }
if (cli.outputPath)                { opts.outputs = cli.outputPath; }
if (cli.relpaths)                  { opts.relPaths = true; }
if (cli.outputOnly)                { opts.outputOnly = true; }
if (cli.htmlOnly)                  { opts.htmlOnly = true; }
if (cli.static.length)             { opts.staticPaths = cli.static; }
if (cli.staticOnly.length)         { opts.staticOnly = cli.staticOnly; }
if (cli.mdFragments)               { opts.fragmentDelim = 'md-headings'; }
if (cli.ignoreConfig)              { opts.ignoreConfig = true; }
if (cli.pages)                     { opts.logPages = true; }
if (!cli.watch || cli.outputOnly || cli.htmlOnly) { opts['no-watch'] = true; }
if (!cli.sockets || cli.outputOnly) { opts['no-sockets'] = true; }
if (cli.editor && !cli.staticOnly.length) { opts.editor = true; }
if (cli.dbg)                       { opts.dbg = process.env.DEBUG || '*'; opts['no-timeouts'] = true; }

var server = require('../server')(opts);

if (cli.config) return console.log(u.inspect(u.omit(opts, 'source$', 'output$'), {depth:2, colors:true}));

server.run();

//--//--//--//--//--//--//--//--//

function collect(val, arr) {
  arr.push(val);
  return arr;
}

function collectStaticPaths(val, arr) {
  var pair = val.split(',');

  if (pair.length > 1) {
    arr.push( { path: pair[0], route: pair[1] } );
  }
  else {
    arr.push( { path: pair[0] } );
  }

  return arr;
}
