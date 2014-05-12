define(['sge','./core', 'sat'], function(sge, core, sat){
	var PhysicsSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state
			this.entities = [];
			this.map = null;
			this.space = new cp.Space();
		},
		tick: function(delta, entities){
			this.entities.forEach(function(e){
				if (e.movement){
					var speed = 32;
					e.movement.body.setPos(cp.v(e.xform.tx+(speed*e.movement.vx),e.xform.ty+(speed*e.movement.vy)))
				}
				if (e.physics.active){
					if (!e.physics.shape.space){
						this.space.addShape(e.physics.shape);
						this.space.reindexShape(e.physics.shape);
					}
				} else {
					if (e.physics.shape.space){
						this.space.removeShape(e.physics.shape);
						this.space.reindexShape(e.physics.shape);
					}
				}
			}.bind(this))
			this.space.step(delta);
			this.entities.forEach(function(e){
				var shape = e.physics.shape;
				var pos = shape.body.getPos();
				e.xform.tx = pos.x-e.physics.offsetx;
				e.xform.ty = pos.y-e.physics.offsety;
				e.xform.a = shape.body.a;
			});
		},
		setup: function(){
			this.map = this.state.getSystem('map');
			var simplifed = this.map.terrainOutline;
			for (var i = 0; i < simplifed.length-1; i++){
				var shape = new cp.SegmentShape(this.space.staticBody,
													cp.v(simplifed[i][0],simplifed[i][1]),
													cp.v(simplifed[i+1][0], simplifed[i+1][1]), 1);

				var segment = this.space.addShape(shape)
			}
			var shape = new cp.SegmentShape(this.space.staticBody,
													cp.v(simplifed[simplifed.length-1][0],simplifed[simplifed.length-1][1]),
													cp.v(simplifed[0][0], simplifed[0][1]), 1);
			var segment = this.space.addShape(shape);
		},
		addEntity: function(entity){
			if (entity.physics){
				var mass   =  entity.physics.mass;
				var width  =  entity.physics.width;
				var height =  entity.physics.height;
				var body = null;
				var shape = null;
				if (mass>0){
					body = this.space.addBody(new cp.Body(mass, Infinity));
					shape = this.space.addShape(new cp.BoxShape(body, width, height));
					shape.body.setPos(cp.v(entity.xform.tx, entity.xform.ty));
				} else {
					body = new cp.Body(Infinity, Infinity);
					body.nodeIdleTime = Infinity;
					shape = this.space.addShape(new cp.BoxShape(body, width, height));
					shape.body.setPos(cp.v(entity.xform.tx+entity.physics.offsetx, entity.xform.ty+entity.physics.offsety));
					this.space.reindexShape(shape);
				}
				
				entity.physics.shape = shape;

				if (entity.movement) {
					targetBody = new cp.Body(Infinity,Infinity);
					targetBody.setPos(cp.v(entity.xform.tx, entity.xform.ty))
					
					var joint = new cp.PivotJoint(targetBody, body, cp.vzero, cp.vzero);
					joint.maxBias = 200.0;
					joint.maxForce = 3000.0;
					entity.movement.body = targetBody;
					this.space.addConstraint(joint);
				}
				
				this.entities.push(entity);
			}
		}
		})
	return PhysicsSystem;
})