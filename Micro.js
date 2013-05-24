/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	var noValue = {};

	function Micro(callback){
		this.channels = {};
		this.parent = [];
		this.callback = callback || function identity(x){ return x; };
		this.sink = makeSink(this);
	}

	Micro.noValue = noValue;

	Micro.prototype = {
		declaredClass: "events/Micro",
		noValue: noValue,
		on: function on(channelName, callback){
			var micro = callback instanceof Micro ? callback : new Micro(callback);
			if(this.channels.hasOwnProperty(channelName)){
				this.channels[channelName].push(micro);
			}else{
				this.channels[channelName] = [micro];
			}
			micro.parent.push(this.channels[channelName]);
			return micro;
		},
		send: function send(value, copy){
			value = this.callback(value, this.sink);
			if(value !== noValue){
				var channel = this.channels["default"];
				if(channel){
					if(copy){
						channel = channel.slice(0);
					}
					for(var i = 0; i < channel.length; ++i){
						channel[i].send(value, copy);
					}
				}
			}
		},
		release: function release(){
			this.parent.forEach(function(parent){
				var i = parent.indexOf(this);
				parent.splice(i, 1);
			});
			this.parent = [];
		}
	};

	return Micro;

	function makeSink(micro){
		return {
			send: function(channelName, value, copy){
				if(value !== noValue){
					var channel = micro.channels[channelName];
					if(channel){
						if(copy){
							channel = channel.slice(0);
						}
						for(var i = 0; i < channel.length; ++i){
							channel[i].send(value, copy);
						}
					}
				}
				return noValue;
			},
			noValue: noValue
		};
	}
});
