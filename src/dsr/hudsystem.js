define(['sge','./core'], function(sge, core, Entity){
	var HudSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._sprites = {};
			this._highlights = {};
			this.container = new PIXI.DisplayObjectContainer();
			this.state.hudContainer.addChild(this.container);
		},
		setup: function(){
			map = this.state.getSystem('map');
			this.instructions = "Objective: Find the Captain."
			this.instruct = new PIXI.BitmapText(this.instructions, {font: '32px 8bit', align: 'center'});
            this.instruct.position.x = 64;
            this.instruct.position.y = game.renderer.height - 64;
            //this.container.addChild(this.instruct);
		},
		tick: function(delta, entities){
			
		}
	})
	return HudSystem;
})