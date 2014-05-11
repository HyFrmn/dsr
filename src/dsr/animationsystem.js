define(['sge','./core'], function(sge, core, Entity){
	var AnimationSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
		},
		tick: function(delta, entities){
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.animation!==undefined){
					var track = entity.animation.frames[entity.animation.track];
					if (entity.animation.play){
						entity.animation.timeout-=delta;
						if (entity.animation.timeout<=0){
							entity.animation.timeout=1/15;
							entity.animation.frame++;
							if (entity.animation.frame>=track.length){
								entity.animation.frame=0;
							}
						}
					}
					entity.sprite.frame = track[entity.animation.frame];
				}
			}
		}
	})
	return AnimationSystem;
})