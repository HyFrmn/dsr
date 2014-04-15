define(['sge','./core'], function(sge, core, Entity){
	var ConnectionSystem = core.DSRSystem.extend({
		setup: function(){
		
		},
		tick: function(delta, entities){
			for (var i = entities.length - 1; i >= 0; i--) {
					var entity = entities[i];
					if (entity.connection){
						if (entity.connection.bind){
							var entityName = entity.connection.bind.match(/@\((.+)\)/)[1];
							var e = this.state.getEntityByName(entityName);
							if (e){
								var inputPort = e.connection.default_input || 'interact';
								var outputPort = entity.connection.default_output || 'interact';
								entity.on(outputPort, function(){
									this.trigger(inputPort);
								}.bind(e));
							}
							delete entity.connection.bind;
						}
					}
				};	
		}
	})
	return ConnectionSystem;
})