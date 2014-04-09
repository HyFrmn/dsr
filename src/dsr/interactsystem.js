define(['sge','./core', './entity'], function(sge, core, Entity){
	var InteractSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._interactEntity = null;
			this._isInteracting = false;
		},
		setup: function(){
			this.map = this.state.getSystem('map');
		},
		tick: function(delta, entities){

			var tmp_dist = 1000000;
			var tmp_entity = null;
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.interact!==undefined){
					if (entity.highlight!==undefined){
						entity.highlight.visible = false;
						var dx = entity.xform.tx - this.state.pc.xform.tx;
						var dy = entity.xform.ty - this.state.pc.xform.ty;
						var dist = ((dx*dx)+(dy*dy));
						//console.log(dist);
						if (dist<(128*128)){
							if (dist<tmp_dist){
								tmp_dist = dist;
								tmp_entity = entity;
							}
						}
					}
				}
			}
			if (tmp_entity){
				tmp_entity.highlight.visible = true;
				this._interactEntity = tmp_entity;
			} else {
				this._interactEntity = null;
			}

			
			if (this._interactEntity){
				if (this.state.input.isDown('space')){
					if (!this._isInteracting){
						this._isInteracting = true;	
						this._interactEntity.highlight.color = 0xFF0000;
						this._interactEntity.sprite.visible = !this._interactEntity.sprite.visible;
					}
				} else {
					this._isInteracting = false;
					this._interactEntity.highlight.color = 0x0068E6;
				}
			}
		}
	})
	return InteractSystem;
})