/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../EventStream"],
function(module, unit, EventStream){
	"use strict";

	unit.add(module, [
		// copy of micro tests
		{
			test: function test_attach(t){
				var a = new EventStream();
				a.attach(function(value){
					t.info("callback 1: " + value);
					return value + "-a";
				}).attach(function(value){
					t.info("callback 2: " + value);
					return value + "-b";
				});
				t.info("send value");
				a.send("value");
			},
			logs: [
				{text: "send value"},
				{text: "callback 1: value"},
				{text: "callback 2: value-a"}
			]
		},
		{
			test: function test_attach_multi(t){
				var a = new EventStream();
				a.attach(function(value, sink){
					t.info("callback 1: " + value);
					sink.send("val1");
					sink.send("val2");
					return value + "-a";
				}).attach(function(value){
					t.info("callback 2: " + value);
					return value + "-b";
				});
				t.info("send value");
				a.send("value");
			},
			logs: [
				{text: "send value"},
				{text: "callback 1: value"},
				{text: "callback 2: val1"},
				{text: "callback 2: val2"},
				{text: "callback 2: value-a"}
			]
		},
		{
			test: function test_send_many(t){
				var a = new EventStream();
				a.attach(function(value){
					t.info("callback 1: " + value);
					return value + "-a";
				}).attach(function(value){
					t.info("callback 2: " + value);
					return value + "-b";
				});
				t.info("send one");
				a.send("one");
				t.info("send two");
				a.send("two");
				t.info("send three");
				a.send("three");
			},
			logs: [
				{text: "send one"},
				{text: "callback 1: one"},
				{text: "callback 2: one-a"},
				{text: "send two"},
				{text: "callback 1: two"},
				{text: "callback 2: two-a"},
				{text: "send three"},
				{text: "callback 1: three"},
				{text: "callback 2: three-a"}
			]
		},
		{
			test: function test_noValue(t){
				var a = new EventStream();
				a.attach(function(value, sink){
					t.info("callback 1: " + value);
					return sink.noValue;
				}).attach(function(value){
					t.info("callback 2: " + value);
					return value + "-b";
				});
				t.info("send value");
				a.send("value");
			},
			logs: [
				{text: "send value"},
				{text: "callback 1: value"}
			]
		},
		{
			test: function test_release_b(t){
				var a = new EventStream(),
					b = a.attach(function(value){
							t.info("callback 1: " + value);
							return value + "-b";
						});
				b.attach(function(value){
					t.info("callback 2: " + value);
					return value + "-b";
				});
				t.info("send value");
				a.send("value");
				t.info("releasing b");
				b.release();
				a.send("new value");
			},
			logs: [
				{text: "send value"},
				{text: "callback 1: value"},
				{text: "callback 2: value-b"},
				{text: "releasing b"}
			]
		},
		{
			test: function test_release_c(t){
				var a = new EventStream(),
					b = a.attach(function(value){
							t.info("callback 1: " + value);
							return value + "-b";
						}),
					c = b.attach(function(value){
							t.info("callback 2: " + value);
							return value + "-c";
						});
				t.info("send value");
				a.send("value");
				t.info("releasing c");
				c.release();
				a.send("new value");
			},
			logs: [
				{text: "send value"},
				{text: "callback 1: value"},
				{text: "callback 2: value-b"},
				{text: "releasing c"},
				{text: "callback 1: new value"}
			]
		},
		{
			test: function test_multichannel(t){
				var a = new EventStream(),
					b = a.attach(function(value, sink){
							t.info("callback 1: " + value);
							sink.sendToChannel("chan0", value + "-0");
							sink.sendToChannel("chan1", value + "-1");
							sink.sendToChannel("chan2", value + "-2");
							return value + "-a";
						});
				b.attach(function(value){
					t.info("callback 2: " + value);
					return value;
				});
				b.attach("chan0", function(value){
					t.info("chan0: " + value);
					return value;
				});
				b.attach("chan1", function(value){
					t.info("chan1: " + value);
					return value;
				});
				b.attach("chan2", function(value){
					t.info("chan2: " + value);
					return value;
				});
				t.info("send values");
				a.send("value");
				a.send("new value");
			},
			logs: [
				{text: "send values"},
				{text: "callback 1: value"},
				{text: "chan0: value-0"},
				{text: "chan1: value-1"},
				{text: "chan2: value-2"},
				{text: "callback 2: value-a"},
				{text: "callback 1: new value"},
				{text: "chan0: new value-0"},
				{text: "chan1: new value-1"},
				{text: "chan2: new value-2"},
				{text: "callback 2: new value-a"}
			]
		},
		// EventStream-specific tests
		{
			test: function test_attach_streams(t){
				var a = new EventStream(function(value, sink){
							t.info("callback 1: " + value);
							sink.send(value + "-a");
							sink.sendToChannel("special", value + "-b");
							return value + "-c";
						}),
					b = new EventStream(function(value){
							t.info("callback 2: " + value);
							return value + "-d";
						}),
					c = new EventStream(function(value){
							t.info("callback 3: " + value);
							return value + "-e";
						});
				a.attach(b);
				a.attach("special", c);
				t.info("sending value");
				a.send("value");
			},
			logs: [
				{text: "sending value"},
				{text: "callback 1: value"},
				{text: "callback 2: value-a"},
				{text: "callback 3: value-b"},
				{text: "callback 2: value-c"}
			]
		},
		{
			test: function test_errors(t){
				var a = new EventStream();
				a.attach(function(value){
					t.info("callback 1: " + value);
					throw new Error(value + "-err");
				}, function(value){
					t.info("errback 1: " + value);
				}).attach(function(value){
					t.info("callback 2: " + value);
				}, function(value){
					eval(t.TEST("value instanceof Error"));
					t.info("errback 2: " + value.message);
					return value.message + "-2";
				}).attach(function(value){
					t.info("callback 3: " + value);
				}, function(value){
					t.info("errback 3: " + value);
				});
				t.info("sending value");
				a.send("value");
			},
			logs: [
				{text: "sending value"},
				{text: "callback 1: value"},
				{text: "errback 2: value-err"},
				{text: "callback 3: value-err-2"}
			]
		},
		function test_partitioning(t){
			function captureEventStream(array){
				return function(value){
					array.push(value);
					return value;
				}
			}
			var a = new EventStream(function partition(value, sink){
						if(value % 2){
							return sink.sendToChannel("odd", value);
						}
						return value; // even
					}),
				even = [], odd = [];
			a.attach(captureEventStream(even));
			a.attach("odd", captureEventStream(odd));
			for(var i = 0; i < 20; ++i){
				a.send(i);
			}
			eval(t.TEST("t.unify(even, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18])"));
			eval(t.TEST("t.unify(odd,  [1, 3, 5, 7, 9, 11, 13, 15, 17, 19])"));
		}
	]);

	return {};
});
