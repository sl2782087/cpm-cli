#!/usr/bin/env node

const argv = process.argv.slice(2);
const fs = require('fs');
const path = require('path');
const hostFile = path.resolve(__dirname, './HOST');
let closing = 0, timer = null;

(() => {
  if (!argv.length) return;
  if (argv[0] === 'host') {
    HOST(argv[1]);
    return process.exit(0);
  }
  const registry = HOST();
  argv.push('--registry=' + registry);
  listen();
  const ls = require('child_process').spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', argv, { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  ls.on('close', () => {
    if (closing === 1) {
      closing = 2;
    } else {
      destory();
      process.exit(0);
    }
  });
})();

function HOST(registry) {
  if (registry) {
    fs.writeFileSync(hostFile, registry, 'utf8');
    return console.log(`\n 🍡 change registry to '${registry}'\n`);
  }
  if (!fs.existsSync(hostFile)) return console.log(`\n 💀 sorry non-registry\n`);
  registry = fs.readFileSync(hostFile, 'utf8');
  console.log(registry);
  return registry;
}

function close() {
  if ([1, 2].indexOf(closing) > -1) return;
  closing = 1;
  timer = setInterval(() => {
    if (closing === 2) {
      destory();
      clearInterval(timer);
      process.exit(0);
    }
  }, 10);
}

function listen() {
  process.on('SIGINT', close);
  process.on('SIGQUIT', close);
  process.on('SIGTERM', close);
}

function destory() {
  process.off('SIGINT', close);
  process.off('SIGQUIT', close);
  process.off('SIGTERM', close);
}