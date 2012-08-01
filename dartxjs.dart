#library('dartxjs.dart');
#import('dart:html');
#import('dart:json');

class DartToJSCommunicator {
  static List<Function> _handlers;
  static List<Function> _onceHandlers;

  static void initialize() {
    if(_handlers == null) {
      _handlers = new List<Function>();
      _onceHandlers = new List<Function>();

      window.on.message.add(_dispatchMessage);
    }
  }

  static void _dispatchMessage(event) {
    if(_handlers.length == 0 && _onceHandlers.length == 0) {
      return;
    }
    try {
      String json_data = event.data;
      Map<String, Object> cmd = JSON.parse(json_data);
      if(!(cmd is Map) || cmp["rcpt"] != "dart") {
        return;
      }

      // call receiver functions
      for(Function handler in _handlers) {
        handler(cmd["data"]);
      }

      // call once handlers
      for(Function handler in _onceHandlers) {
        handler(cmd["data"]);
      }
      // clear once handlers
      _onceHandlers.clear();

    } catch (Exception e) {
      // ignore data that can't be parsed
    }
  }

  // send a message to js
  static void sendMessage(Map<String, Object> data) {
    window.postMessage(JSON.stringify({"rcpt": "js", "data": data}), window.location.href);
  }

  // add a function to be called when dart gets a message
  static void addReceiver(Function f) {
    _handler.add(f);
  }
  // remove a funciton as a receiver
  static void removeReceiver(Function f) {
    int index = _handlers.indexOf(f);
    if(index != -1) {
      _handlers.removeRange(index, 1);
    }
  }

  // add a function to be called once when dart gets a message
  static void receiveMessage(Function f) {
    // add handler
    _onceHandlers.add(f);
  }
}