/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./EventSource", "./EventSink", "dcl"], function(EventSource, EventSink, dcl){
	"use strict";

	var Value = EventSource.Value;

	return dcl(EventSink, {
		declaredClass: "events/PropertyStream",
		constructor: function(){
			this.micro.callback = makeCallback(this);
		},
		on: dcl.superCall(function(sup){
			return function on(channelName, callback, errback, stopback){
				var result = sup.apply(this, arguments);
				if((typeof channelName != "string" || channelName == "default") && this.lastValue){
					result.micro.send(this.lastValue);
				}
				return result;
			};
		}),
		getValue: function getValue(){
			return this.lastValue && this.lastValue.x;
		},
		isValueAvailable: function isValueAvailable(){
			return !!this.lastValue;
		}
	});

	function makeCallback(stream){
		return function(val){
			if(val instanceof Value){
				stream.lastValue = val;
			}
			return val;
		};
	}
});
