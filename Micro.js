/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	var noValue = {};

	function Micro(callback){
		this.channels = {};
		this.callback = callback || function identity(x){ return x; };
		this.sink = makeSink(this);
	}

	Micro.noValue = noValue;

	Micro.prototype = {
		declaredClass: "events/Micro",
		noValue: noValue,
		attach: function attach(channelName, callback){
			var micro = new Micro(callback);
			if(this.channels.hasOwnProperty(channelName)){
				this.channels[channelName].push(micro);
			}else{
				this.channels[channelName] = [micro];
			}
			micro.parentChannel = this.channels[channelName];
			return micro;
		},
		send: function send(value){
			value = this.callback(value, this.sink);
			if(value !== noValue){
				var channel = this.channels["default"];
				if(channel){
					for(var i = 0; i < channel.length; ++i){
						channel[i].send(value);
					}
				}
			}
		},
		release: function release(){
			if(this.parentChannel){
				var i = this.parentChannel.indexOf(this);
				this.parentChannel.splice(i, 1);
				delete this.parentChannel;
			}
		}
	};

	return Micro;

	function makeSink(micro){
		return {
			send: function(channelName, value){
				if(value !== noValue){
					var channel = micro.channels[channelName];
					if(channel){
						for(var i = 0; i < channel.length; ++i){
							channel[i].send(value);
						}
					}
				}
				return noValue;
			},
			noValue: noValue
		};
	}
});
