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
		}
	]);

	return {};
});
