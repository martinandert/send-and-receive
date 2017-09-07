var path = require('path');
var chalk = require('chalk');
var Nightmare = require('nightmare');

var nightmare = Nightmare({ show: false });

var tests = [];
var test;
var errored;

nightmare.on('console', function(method, message) {
  var args = [].slice.call(arguments, 2);

  switch (message) {
    case 'start':
      test = { title: args[0] };
      tests.push(test);
      break;

    case 'skip':
      test = { title: args[0], skipped: true };
      tests.push(test);
      break;

    case 'error':
      test.errored = true;
      test.errorMessage = args.join(' ');
      break;

    case 'end':
      if (test.errored) {
        console.log(chalk.red('❌ ' + test.title));
        console.log('  ⤷ ' + test.errorMessage);
        errored = true;
      } else if (test.skipped) {
        console.log(chalk.yellow('⬚ ' + test.title + ' (skipped)'));
      } else {
        console.log(chalk.green('✔ ' + test.title));
      }
      break;
  }
});

console.log('running tests...');

var timeout = setTimeout(() => {
  console.log('timed out!');
  process.exit(1);
}, 10000);

nightmare
  .goto('file://' + path.resolve(__dirname, 'index.html'))
  .run(() => {
    console.log('...tests completed');
    process.exit(errored ? 1 : 0);
  });
