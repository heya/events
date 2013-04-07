/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Micro"], function(Micro){
	"use strict";

	function Value(x){ this.x = x; }
	function ErrorValue(x){ this.x = x; }
	function Stop(x){ this.x = x; }

	function EventSource(micro){
		this.micro = micro || new Micro();
		this.sink = this.micro.sink;
		this.micro.sink = makeSink(this);
		if(!micro){
			this.micro.callback = makeDefaultCallback(this.micro);
		}
	}

	EventSource.noValue = Micro.noValue;
	EventSource.Value = Value;
	EventSource.ErrorValue = ErrorValue;
	EventSource.Stop = Stop;
	EventSource.makeMultiplexer = makeMultiplexer;

	EventSource.prototype = {
		declaredClass: "events/EventSource",
		attach: function attach(channelName, callback, errback, stopback){
			if(typeof channelName != "string"){
				stopback = errback, errback = callback,
				callback = channelName, channelName = "default";
			}
			if(callback instanceof EventSource){
				this.micro.attach(channelName, callback.micro);
				return callback;
			}
			var es = new EventSource(this.micro.attach(channelName));
			es.micro.callback = EventSource.makeMultiplexer(es, callback, errback, stopback);
			return es;
		},
		release: function release(){
			this.micro.release();
			var channels = this.micro.channels, value = new Stop(this), ch;
			this.micro.send(value, true);
			for(ch in channels){
				if(ch != "default" && channels.hasOwnProperty(ch)){
					this.sink.send(ch, value, true);
				}
			}
		}
	};

	return EventSource;

	function makeMultiplexer(source, callback, errback, stopback){
		callback = typeof callback == "function" && callback;
		errback  = typeof errback  == "function" && errback;
		stopback = typeof stopback == "function" && stopback;
		return function(val, sink){
			try{
				if(callback && val instanceof Value){
					val = callback(val.x, sink);
					val = val === Micro.noValue ? val : new Value(val);
				}else if(errback && val instanceof ErrorValue){
					val = errback(val.x, sink);
					val = val === Micro.noValue ? val : new Value(val);
				}else if(val instanceof Stop){
					source.micro.release();
					if(stopback){
						val = stopback(val.x, sink);
						val = val === Micro.noValue ? val : new Stop(val);
					}
				}
			}catch(e){
				val = new ErrorValue(e);
			}
			return val;
		};
	}

	function makeSink(source){
		return {
			send: function send(value){
				return source.sink.send("default", new Value(value));
			},
			sendError: function sendError(value){
				return source.sink.send("default", new ErrorValue(value));
			},
			stop: function stop(value){
				return source.sink.send("default", new Stop(value), true);
			},
			sendToChannel: function sendToChannel(channelName, value){
				return source.sink.send(channelName, new Value(value));
			},
			sendErrorToChannel: function sendErrorToChannel(channelName, value){
				return source.sink.send(channelName, new ErrorValue(value));
			},
			stopChannel: function stopChannel(channelName, value){
				return source.sink.send(channelName, new Stop(value), true);
			},
			noValue: EventSource.noValue
		}
	}

	function makeDefaultCallback(micro){
		return function(val){
			if(val instanceof Stop){
				micro.release();
			}
			return val;
		};
	}
});