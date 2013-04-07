/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./EventSource"], function(EventSource){
	"use strict";

	var Value = EventSource.Value, ErrorValue = EventSource.ErrorValue,
		Stop = EventSource.Stop;

	function EventStream(callback, errback, stopback){
		EventSource.call(this);
		if(callback || errback || stopback){
			this.micro.callback = EventSource.makeMultiplexer(
				this, callback, errback, stopback);
		}
	}
	EventStream.prototype = Object.create(EventSource.prototype);

	EventStream.prototype.send = function send(value){
		this.micro.send(new Value(value));
	};
	EventStream.prototype.sendError = function sendError(value){
		this.micro.send(new ErrorValue(value));
	};
	EventStream.prototype.stop = function stop(value){
		this.micro.send(new Stop(value), true);
	};

	return EventStream;
});
