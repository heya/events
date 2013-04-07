/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./EventSource", "./EventStream"], function(EventSource, EventStream){
	"use strict";

	var Value = EventSource.Value;

	function PropertyStream(){
		EventStream.call(this);
		this.micro.callback = makeCallback(this);
	}
	PropertyStream.prototype = Object.create(EventStream.prototype);

	PropertyStream.prototype.attach = function attach(
				channelName, callback, errback, stopback){
		var result = EventStream.prototype.attach.call(
				this, channelName, callback, errback, stopback);
		if(typeof channelName != "string" ||
				channelName == "default" && this.lastValue){
			result.micro.send(this.lastValue);
		}
		var result;
	};

	PropertyStream.prototype.getValue = function(){
		return this.lastValue && this.lastValue.x;
	};

	PropertyStream.prototype.isValueAvailable = function(){
		return !!this.lastValue;
	};

	return PropertyStream;

	function makeCallback(stream){
		return function(val){
			if(val instanceof Value){
				stream.lastValue = val;
			}
			return val;
		};
	}
});
