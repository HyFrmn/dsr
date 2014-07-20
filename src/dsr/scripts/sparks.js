entity.script.tick = function(delta){
	noise.seed(entity.id);
	var val = noise.perlin2(state.getTime(), 0);
	entity.particles.emit_amount = 0;
	entity.light.intensity = Math.max(entity.light.intensity-0.01,0);
	if (val>0){
		entity.particles.emit_amount = 30 * entity.light.intensity;
		entity.light.intensity = Math.min(entity.light.intensity+0.05,1);
	
		var entities = state.getEntitiesByAABB(entity.xform.tx, entity.xform.ty+32, 32, 64);
		if (entities.length>0){
			for (var i = entities.length - 1; i >= 0; i--) {
				var e = entities[i];
				if (e.chara!=undefined){
					var impact = {xform: entity.xform};
					state.getSystem('survival').takeDamage(e, impact, entity);
				}
			}
		}
	}
}

//entity.script.tick()