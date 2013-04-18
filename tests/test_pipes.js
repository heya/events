/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../EventStream"],
function(module, unit, EventStream){
	"use strict";

	unit.add(module, [
		function test_pipe_like_methods(t){
			var a = new EventStream(), x = [];
			a.filter(function(value){
				return value % 2;
			}).map(function(value){
				return value * value;
			}).scan(function(acc, value){
				return acc + value;
			}, 0).forEach(function(value){
				x.push(value);
			});
			for(var i = 0; i < 10; ++i){
				a.send(i);
			}
			eval(t.TEST("t.unify(x, [1, 10, 35, 84, 165])"));
		}
	]);

	return {};
});
