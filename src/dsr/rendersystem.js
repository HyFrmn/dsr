define(['sge','./core'], function(sge, core, Entity){
	var RenderSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._sprites = {};
			this._highlights = {};
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);
			this.spriteContainer = new PIXI.DisplayObjectContainer();
			this.floorContainer = new PIXI.DisplayObjectContainer();
			this.container.addChild(this.floorContainer);
			this.container.addChild(this.spriteContainer);
		},
		setup: function(){
			map = this.state.getSystem('map');
			this.floorContainer.mask = map.layerMask;
			this.spriteContainer.mask = map.canopyMask;
		},
		tick: function(delta, entities){
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.highlight){
						var highlight = this._highlights[entity.id];
						if (highlight==undefined){
							if (entity.highlight.visible){
								highlight = new PIXI.Graphics();
								highlight.beginFill(0xFFFFFF);
								highlight.drawCircle(0,0,32,32);
								highlight.endFill();
								this.floorContainer.addChild(highlight);
								this._highlights[entity.id] = highlight;
								highlight.tint =entity.highlight.color;
								highlight.position.x = entity.xform.tx;
								highlight.position.y = entity.xform.ty;	
							}
						} else {
							if (!entity.highlight.visible){
								this.floorContainer.removeChild(highlight);
								delete this._highlights[entity.id];
							} else {
									highlight.tint =entity.highlight.color;
									highlight.position.x = entity.xform.tx;
									highlight.position.y = entity.xform.ty;
							}
						}
				}
				if (entity.sprite!==undefined){
					var sprite = this._sprites[entity.id];
					if (sprite==undefined){
						sprite = new PIXI.Sprite.fromFrame(entity.sprite.src + '-' + entity.sprite.frame);
						this.spriteContainer.addChild(sprite);
						console.log(entity.sprite.src + '-' + entity.sprite.frame);
						this._sprites[entity.id]=sprite;
					}
					sprite.visible = entity.sprite.visible;
					sprite.position.x = entity.xform.tx + entity.sprite.offsetx - sprite.width/2;
					sprite.position.y = entity.xform.ty + entity.sprite.offsety - sprite.height/2;
				}
			};
		}
	})
	return RenderSystem;
})