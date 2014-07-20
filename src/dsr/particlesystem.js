DEBUG=0
define(['sge','./core'], function(sge, core, Entity){
	var ParticleSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._sprites = {};
			this._highlights = {};
			this._systems = {};
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);
		},
		setup: function(){
		
		},
		tick: function(delta, entities){
			var keys = Object.keys(this._systems);
			for (var i = keys.length - 1; i >= 0; i--) {
				this.tickSystem(delta, this._systems[keys[i]], this.state.getEntity(keys[i]));
			};
		},
		tickSystem: function(delta, sys, e){
			sys.emitter.counter += (e.particles.emit_amount * delta);
			while (Math.floor(sys.emitter.counter)>0){
					sys.emitter.counter--
					var life = Math.random()*0.5+0.2;
					var emitx = (Math.random() * 2.0) - 1;
					var emity = (Math.random() * 2.0) - 1;
					var emitspeed = Math.random() * 25 + 75;
					if (sys.emitter.type=='dir'){
						emitx *= e.particles.emit_dir_var[0];
						emity *= e.particles.emit_dir_var[1];
						emitx += e.particles.emit_dir[0];
						emity += e.particles.emit_dir[1];	
					}
					sys.particles.push({x:e.xform.tx,y:e.xform.ty,vx:emitx*emitspeed,vy:emity*emitspeed,life:life,lifeSpan:life,tint:0x0000FF});
				
			}
			for (var q = sys.particles.length - 1; q >= 0; q--) {
				var part = sys.particles[q];
				part.x += part.vx*delta;
				part.y += part.vy*delta;
				part.life -= delta;
				part.alpha = part.life/part.lifeSpan;
				part.scale = part.life/part.lifeSpan;
				part.frame = Math.floor(40*(1-(part.life/part.lifeSpan)))
				part.rotation = Math.atan(part.vy/part.vx);
				part.tint = 0xFFFF66;
			};

			sys.particles = sys.particles.filter(function(p){return p.life>0});
		},
		addEntity: function(e){
			if (e.particles){
				this._systems[e.id] = {
					particles:[],
					sprites:[],
					emitter: {
						timeout: 0,
						counter: 0,
						amount: e.particles.emit_amount,
						type: e.particles.emit_type,
						dir: e.particles.emit_dir,
						dir_var: e.particles.emit_dir_var,
					}
				}
			}
		},
		render: function(){
			var keys = Object.keys(this._systems);
			for (var i = keys.length - 1; i >= 0; i--) {
				this.renderSystem(this._systems[keys[i]]);
			};
		},
		renderSystem: function(sys){
			while (sys.sprites.length<sys.particles.length){
				//*
				var sprite =  new PIXI.Graphics();//
				sprite.beginFill(0xFFFFFF);
				sprite.drawRect(0,0,10,3);
				sprite.endFill();
				//*/
				//var sprite = new PIXI.Sprite.fromFrame('smoke-0');
				sprite.anchor = {x:0.5,y:0.5}
				//sprite.blendMode = PIXI.blendModes.ADD;
				sys.sprites.push(sprite);
				
				this.container.addChild(sprite);
			}
			for (var q = sys.sprites.length - 1; q >= 0; q--) {
				sys.sprites[q].visible=false;
			}
			for (var q = sys.particles.length - 1; q >= 0; q--) {
				sys.sprites[q].position.x = sys.particles[q].x;
				sys.sprites[q].position.y = sys.particles[q].y;
				sys.sprites[q].alpha = sys.particles[q].alpha;
				sys.sprites[q].tint = sys.particles[q].tint;
				sys.sprites[q].rotation = sys.particles[q].rotation;
				sys.sprites[q].scale.x = sys.particles[q].scale;
				sys.sprites[q].scale.y = sys.particles[q].scale;
				sys.sprites[q].visible=true;
				//sys.sprites[q].setTexture(PIXI.TextureCache['smoke-' + sys.particles[q].frame])
			};
			
		}

	})
	return ParticleSystem;
})