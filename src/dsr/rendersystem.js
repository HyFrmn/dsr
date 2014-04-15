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
								if (entity.interact.targets){
									entity.interact.targets.forEach(function(target){
										highlight.drawCircle(target[0],target[1],entity.highlight.radius,entity.highlight.radius);
									})
								} else {
									highlight.drawCircle(0,0,entity.highlight.radius,entity.highlight.radius);
								}
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
						this._sprites[entity.id]=sprite;
					}
					sprite.setTexture(PIXI.TextureCache[entity.sprite.src + '-' + entity.sprite.frame])
					sprite.visible = entity.sprite.visible;
					sprite.position.x = entity.xform.tx + entity.sprite.offsetx - sprite.width/2;
					sprite.position.y = entity.xform.ty + entity.sprite.offsety - sprite.height/2;
				}
			};
		}
	})
	return RenderSystem;
})