define(['sge','./core'], function(sge, core, Entity){
	var ControlSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
		},
		tick: function(delta, entities){
			var speed = 1;

			this.state.pc.movement.vx = this.state.pc.movement.vy =0
			if (this.state.input.isDown('left')){
				this.state.pc.movement.vx = -speed;
			}

			if (this.state.input.isDown('right')){
				this.state.pc.movement.vx = speed;
			}

			if (this.state.input.isDown('up')){
				this.state.pc.movement.vy = -speed;
			}

			if (this.state.input.isDown('down')){
				this.state.pc.movement.vy = speed;
			}
		}
	})
	return ControlSystem;
})