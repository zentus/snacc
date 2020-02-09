var combine = require('stream-combiner');
var split = require('split');
var through = require('through');

module.exports =
function createParser() {
  var JSONParse = through(function (data) {
    if (data) {
      try {
        data = JSON.parse(data)
      } catch(err) {
        // s.emit('not-json', data);
				const nickname = data.trim().split('/nick ')[1]
				const eventMessage = nickname ? ['user-connect', nickname] : ['message-to-server', data.trim() + '\n']

				this.queue(eventMessage);
        return;
      }
      this.queue(data);
    }
  });

  var s = combine(split('\n'), JSONParse);
  return s;
};
