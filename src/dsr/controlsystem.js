define(['sge','./core'], function(sge, core, Entity){
	var ControlSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
		},
		tick: function(delta, entities){
			var speed = 1;

			if (this.state.pc.chara.control){
				this.state.pc.movement.vx = this.state.pc.movement.vy =0
				
				if (this.state.input.isDown('left')){
					this.state.pc.movement.vx = -speed;
					this.state.pc.animation.track = "walk_west";
					this.state.pc.chara.direction = "west";
				}

				if (this.state.input.isDown('right')){
					this.state.pc.movement.vx = speed;
					this.state.pc.animation.track = "walk_east";
					this.state.pc.chara.direction = "east";
				}

				if (this.state.input.isDown('up')){
					this.state.pc.movement.vy = -speed;
					this.state.pc.animation.track = "walk_north";
					this.state.pc.chara.direction = "north";
				}

				if (this.state.input.isDown('down')){
					this.state.pc.movement.vy = speed;
					this.state.pc.animation.track = "walk_south";
					this.state.pc.chara.direction = "south";
				}


				if (this.state.pc.movement.vx !=0 || this.state.pc.movement.vy != 0){
					this.state.pc.animation.play = true;
					
				} else {
					this.state.pc.animation.play = false;
					this.state.pc.animation.frame = 0;
					this.state.pc.animation.track = "idle_" + this.state.pc.chara.direction;
				}

				//Turn on Light
				if (this.state.input.isPressed('F')){
					this.state.pc.light.enabled = !this.state.pc.light.enabled;
				}
			}
		}
	})
	return ControlSystem;
})