define(['sge','./core', 'sat'], function(sge, core, sat){
	var PhysicsSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state
			this.entities = [];
			this.map = null;
			this.space = new cp.Space()
			//this.space.gravity = cp.v(0,100)
		},
		tick: function(delta, entities){
			this.entities.forEach(function(e){
				if (e.movement){
					var speed = 32;
					e.movement.body.setPos(cp.v(e.xform.tx+(speed*e.movement.vx),e.xform.ty+(speed*e.movement.vy)))
				}
			})
			this.space.step(delta);
			this.entities.forEach(function(e){
				var shape = e.physics.shape;
				var pos = shape.body.getPos();
				e.xform.tx = pos.x;
				e.xform.ty = pos.y;
				e.xform.a = shape.body.a;
			})
		},
		setup: function(){
			this.map = this.state.getSystem('map');
		},
		addEntity: function(entity){
			if (entity.physics){
				var mass   =  1;
				var width  =  32;
				var height =  32;
				var body = this.space.addBody(new cp.Body(mass, Infinity));
				var shape = this.space.addShape(new cp.BoxShape(body, width, height));
				body.setPos(cp.v(entity.xform.tx, entity.xform.ty));
				entity.physics.shape = shape;

				if (entity.movement) {
					targetBody = new cp.Body(Infinity,Infinity);
					targetBody.setPos(cp.v(entity.xform.tx+96, entity.xform.ty))
					
					var joint = new cp.PivotJoint(targetBody, body, cp.vzero, cp.vzero);
					joint.maxBias = 200.0;
					joint.maxForce = 3000.0;
					entity.movement.body = targetBody;
					this.space.addConstraint(joint);
				}
				
				this.entities.push(entity);
			}
		},
		setMap: function(state){
			this.state = state;
			this.map = state.map;
		}
		})
	return PhysicsSystem;
})