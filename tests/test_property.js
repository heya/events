/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../PropertyStream"],
function(module, unit, PropertyStream){
	"use strict";

	unit.add(module, [
		{
			test: function test_property(t){
				var a = new PropertyStream();
				t.info("attaching 1");
				a.on(function(value){ t.info("callback 1: " + value); });
				t.info("sending value");
				a.send("value");
				t.info("attaching 2");
				a.on(function(value){ t.info("callback 2: " + value); });
				t.info("sending another");
				a.send("another");
				t.info("attaching 3");
				a.on(function(value){ t.info("callback 3: " + value); });
				t.info("sending new");
				a.send("new");
			},
			logs: [
				{text: "attaching 1"},
				{text: "sending value"},
				{text: "callback 1: value"},
				{text: "attaching 2"},
				{text: "callback 2: value"},
				{text: "sending another"},
				{text: "callback 1: another"},
				{text: "callback 2: another"},
				{text: "attaching 3"},
				{text: "callback 3: another"},
				{text: "sending new"},
				{text: "callback 1: new"},
				{text: "callback 2: new"},
				{text: "callback 3: new"}
			]
		},
		function test_property_value(t){
			var a = new PropertyStream();
			eval(t.TEST("!a.isValueAvailable() && a.getValue() === undefined"));
			a.send("value");
			eval(t.TEST("a.isValueAvailable() && a.getValue() == 'value'"));
			a.send("another");
			eval(t.TEST("a.isValueAvailable() && a.getValue() == 'another'"));
			a.send("new");
			eval(t.TEST("a.isValueAvailable() && a.getValue() == 'new'"));
		}
	]);

	return {};
});
