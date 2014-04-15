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
			this.instruct = new PIXI.BitmapText('', {font: '32px 8bit', align: 'center'});
            this.instruct.position.x = 64;
            this.instruct.position.y = game.renderer.height - 64;
            this.instruct.visible = false;
            this.container.addChild(this.instruct);
		},
		tick: function(delta, entities){
			if (this.instructions!=this._instructions){
				this._instructions=this.instructions;
				if (this.instructions){
					this.instruct.visible = true;
					this.instruct.setText(this.instructions);
				} else {
					this.instruct.visible = false;
				}
				
			}
		}
	})
	return HudSystem;
})