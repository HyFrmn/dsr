define(['sge','./core'], function(sge, core, Entity){
	var ScriptSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
		},
		load: function(){

		},
		setup: function(map){

		},
		tick: function(delta, entities){
			
		}
	})
	return ScriptSystem;
})