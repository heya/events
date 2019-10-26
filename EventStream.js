/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./EventSource", "./EventSink", "dcl"], function(EventSource, EventSink, dcl){
	"use strict";

	return dcl(EventSink, {
		declaredClass: "events/EventStream",
		constructor: function(callback, errback, stopback){
			if(callback || errback || stopback){
				this.micro.callback = EventSource.makeMultiplexer(
					this, callback, errback, stopback);
			}
		}
	});
});
