/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./EventSource"], function(EventSource){
	"use strict";

	var Value = EventSource.Value;

	function Interval(ms, suspended){
		EventSource.call(this);
		this.ms = ms;
		if(!suspended){
			startTicks(this);
		}
	}
	Interval.prototype = Object.create(EventSource.prototype);

	Interval.prototype.suspend = function suspend(){
		if(this.handle){
			clearInterval(this.handle);
			delete this.handle;
		}
	};

	Interval.prototype.resume = function resume(){
		if(!this.handle){
			startTicks(this);
		}
	};

	Interval.prototype.isSuspended = function isSuspended(){
		return !this.handle;
	};

	Interval.prototype.getValue = function getValue(){
		return this.lastValue && this.lastValue.x;
	};

	Interval.prototype.isValueAvailable = function isValueAvailable(){
		return !!this.lastValue;
	};

	Interval.prototype.release = function release(){
		EventSource.prototype.release.call(this);
		this.suspend();
	};

	function interval(ms, suspended){
		return new Interval(ms, suspended);
	}
	interval.Interval = Interval;

	return interval;

	function startTicks(stream){
		stream.handle = setInterval(function(){
			stream.micro.send(stream.lastValue = new Value(new Date().getTime()));
		}, ms);
	}
});
