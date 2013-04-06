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
	}

	EventSource.noValue = Micro.noValue;
	EventSource.Value = Value;
	EventSource.ErrorValue = ErrorValue;
	EventSource.Stop = Stop;

	EventSource.prototype = {
		declaredClass: "events/EventSource",
		attach: function attach(channelName, callback, errback, stopback){
			return new EventSource(typeof channelName == "string" ?
				this.micro.attach(channelName, makeMultiplexer(callback, errback, stopback)) :
				this.micro.attach("default", makeMultiplexer(channelName, callback, errback)));
		},
		release: function release(){
			this.micro.release();
		}
	};

	EventSource.prototype.destroy = EventSource.prototype.release;

	return EventSource;

	function makeMultiplexer(callback, errback, stopback){
		callback = typeof callback == "function" && callback;
		errback  = typeof errback  == "function" && errback;
		stopback = typeof stopback == "function" && stopback;
		return function(val, sink){
			try{
				if(val instanceof Value){
					if(callback){
						val = callback(val.x, sink);
						val = val === Micro.noValue ? val : new Value(val);
					}
					return val;
				}
				if(val instanceof ErrorValue){
					if(errback){
						val = errback(val.x, sink);
						val = val === Micro.noValue ? val : new Value(val);
					}
					return val;
				}
				if(val instanceof Stop){
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

	function makeSink(stream){
		return {
			send: function send(value){
				return stream.sink.send("default", new Value(value));
			},
			sendError: function sendError(value){
				return stream.sink.send("default", new ErrorValue(value));
			},
			stop: function stop(value){
				return stream.sink.send("default", new Stop(value));
			},
			sendToChannel: function sendToChannel(channelName, value){
				return stream.sink.send(channelName, new Value(value));
			},
			sendErrorToChannel: function sendErrorToChannel(channelName, value){
				return stream.sink.send(channelName, new ErrorValue(value));
			},
			stopChannel: function stopChannel(channelName, value){
				return stream.sink.send(channelName, new Stop(value));
			},
			noValue: EventSource.noValue
		}
	}
});