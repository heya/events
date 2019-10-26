/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./EventSource", "dcl"], function(EventSource, dcl){
	"use strict";

	var Value = EventSource.Value, ErrorValue = EventSource.ErrorValue,
		Stop = EventSource.Stop;

	return dcl(EventSource, {
		declaredClass: "events/EventSink",
		send: function send(value){
			this.micro.send(new Value(value));
		},
		sendError: function sendError(value){
			this.micro.send(new ErrorValue(value));
		},
		stop: function stop(value){
			this.micro.send(new Stop(value), true);
		}
	});
});
