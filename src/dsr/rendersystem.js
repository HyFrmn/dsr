DEBUG=0
define(['sge','./core'], function(sge, core, Entity){
	var RenderSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._sprites = {};
			this._highlights = {};
			this._minis = {};
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);
			this.spriteContainer = new PIXI.DisplayObjectContainer();
			this.floorContainer = new PIXI.DisplayObjectContainer();
			this.minimapContainer = new PIXI.DisplayObjectContainer();
			this.container.addChild(this.floorContainer);
			this.container.addChild(this.spriteContainer);
			this.state.hudContainer.addChild(this.minimapContainer);
			
		},
		setup: function(){
			map = this.state.getSystem('map');
			this.floorContainer.mask = map.layerMask;
			this.spriteContainer.mask = map.canopyMask;
			

			var outline = new PIXI.Graphics();
			var vertexs = map.traceContour('passable');
			outline.lineStyle(2, 0xFF0000);
			outline.beginFill(0x330000);
			var last = vertexs[0];
			var outlineScale=0.1;
			outline.moveTo(last[0]*outlineScale,last[1]*outlineScale);
			for (var i = 1; i < vertexs.length; i++) {
				var vert = vertexs[i];
				var next = vertexs[i+1];
				outline.lineTo(vert[0]*outlineScale,vert[1]*outlineScale);
				last = vert;
			}
			outline.lineTo(vertexs[0][0]*outlineScale,vertexs[0][1]*outlineScale);
			outline.endFill();
			this.minimapContainer.addChild(outline);
		},
		tick: function(delta, entities){
			var spriteList = [];
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
						this._sprites[entity.id]=sprite;
					} else {
						if (sprite.parent){
							this.spriteContainer.removeChild(sprite);
						}
					}
					try {
					    sprite.setTexture(PIXI.TextureCache[entity.sprite.src + '-' + entity.sprite.frame])
					}
					catch(err) {
						console.log(entity.sprite.src + '-' + entity.sprite.frame);
					    console.log(err);
					}
					
					sprite.visible = entity.sprite.visible;
					sprite.position.x = entity.xform.tx + entity.sprite.offsetx - sprite.width/2;
					sprite.position.y = entity.xform.ty + entity.sprite.offsety - sprite.height/2;
					sprite.tint = entity.sprite.tint;
					var screenX = this.state.mapContainer.position.x+entity.xform.tx;
					var screenY = this.state.mapContainer.position.y+sprite.position.y;
					
					if (entity.name=="switch.test"){
						//console.log(screenX, this.state.mapContainer.position.x, sprite.position.x, entity.xform.tx);
					}
					
					sprite.rotation = entity.xform.a || 0;
					if (screenX<this.state.game.width+sprite.width&&screenX>-sprite.width&&screenY>-sprite.height&&screenY<this.state.game.height+sprite.height){
						spriteList.push(sprite);
					}
				}
				if (entity.minimap!==undefined){
					var mini = this._minis[entity.id];
					if (mini==undefined){
						mini = new PIXI.Graphics();
						mini.beginFill(0xFFFF00);
						mini.drawRect(-2,-2,4,4);
						mini.endFill()
						this._minis[entity.id] = mini;
						this.minimapContainer.addChild(mini);
					}
					mini.position.x = entity.xform.tx * 0.1;
					mini.position.y = entity.xform.ty * 0.1;
				}
			}
			
			//SORT SPRITES... UGH
			spriteList = spriteList.sort(function(a,b){ 
				return a.position.y - b.position.y;
			})
			spriteList.forEach(function(sprite){
				this.spriteContainer.addChild(sprite);
			}.bind(this));
		}
	})
	return RenderSystem;
})