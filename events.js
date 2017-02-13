import * as Utils from '@flexui/utils';

var slice = Utils.AP.slice;

export default function Events() {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

Events.prototype = {
  on: function(name, listener, context) {
    var self = this;
    var events = self.__events || (self.__events = {});

    context = arguments.length < 3 ? self : context;

    (events[name] || (events[name] = [])).push({
      fn: listener,
      context: context
    });

    return self;
  },
  once: function(name, listener, context) {
    var self = this;

    function feedback() {
      self.off(name, feedback);
      Utils.apply(listener, this, arguments);
    };

    return self.on(name, feedback, context);
  },
  emit: function(name) {
    var context = this;
    var data = slice.call(arguments, 1);
    var events = context.__events || (context.__events = {});
    var listeners = events[name] || [];

    var result;
    var listener;
    var returned;

    // emit events
    for (var i = 0, length = listeners.length; i < length; i++) {
      listener = listeners[i];
      result = Utils.apply(listener.fn, listener.context, data);

      if (returned !== false) {
        returned = result;
      }
    }

    return returned;
  },
  off: function(name, listener, context) {
    var self = this;
    var events = self.__events || (self.__events = {});
    var length = arguments.length;

    switch (length) {
      case 0:
        self.__events = {};
        break;
      case 1:
        delete events[name];
        break;
      default:
        if (listener) {
          var listeners = events[name];

          if (listeners) {
            context = length < 3 ? self : context;
            length = listeners.length;

            for (var i = 0; i < length; i++) {
              if (events[i].fn === listener && events[i].fn.context === context) {
                listeners.splice(i, 1);
                break;
              }
            }

            // Remove event from queue to prevent memory leak
            // Suggested by https://github.com/lazd
            // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910
            if (!listeners.length) {
              delete events[name];
            }
          }
        }
        break;
    }

    return self;
  }
};
