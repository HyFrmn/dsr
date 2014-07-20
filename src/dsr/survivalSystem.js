DEBUG=0
define(['sge','./core'], function(sge, core, Entity){
	var SurvivalSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._sprites = {};
			this._highlights = {};
			this._systems = {};
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);
		},
		addEntity: function(e){
			if (e.survival){
				e.survival._hitTimeout =-1;
				e.survival._freezeTimeout =-1;
				e.survival._hitSrc = null;
			}
		},
		takeDamage: function(e, impact, src){
			if (e.survival._hitSrc==null){
				e.survival._hitSrc = src;
				e.survival.health -= src.damageprofile.damage;
				e.survival._hitTimeout = this.state.getTime() + 0.1*src.damageprofile.damage;
				e.survival._freezeTimeout = this.state.getTime() + 0.1;
				e.chara.control = false;
				console.log(e.xform.tx, impact.xform.tx)
				e.movement.vx = e.xform.tx - impact.xform.tx;
				e.movement.vy = e.xform.ty - impact.xform.ty;
				var length = Math.sqrt(e.movement.vx*e.movement.vx+e.movement.vy*e.movement.vy);
				e.movement.vx *= 2/length;
				e.movement.vy *= 2/length;
				console.log(e)
				e.sprite.tint = 0xFF3333;

				if (e.pc && e.survival.health<=0){
					this.state.game.changeState('gameover');
				}
			}
		},
		tick: function(delta, entities){
			for (var i = entities.length - 1; i >= 0; i--) {
				if(entities[i].survival){
					var e = entities[i];
					if (e.survival._freezeTimeout <= this.state.getTime()){
						e.movement.vx = 0;
						e.movement.vy = 0;
					}
					if (e.survival._hitTimeout <= this.state.getTime()){
						e.chara.control = true;
						e.sprite.tint = 0xFFFFFF;
						e.survival._hitSrc = null;
					}
				}
			};
		}
	})
	return SurvivalSystem;
})