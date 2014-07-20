define(['sge','./core'], function(sge, core, Entity){
	var LightSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._lightUpdated = false;
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);

			this.shadowContainer = new PIXI.DisplayObjectContainer();

			this.fog = new PIXI.Graphics();
			
			this._lights = {};
			
		},
		setup: function(){
			this.map = this.state.getSystem('map');
			renderer = this.state.getSystem('render');

			this.shadow = new PIXI.Graphics();
			this.shadow.beginFill(0);
			this.shadow.drawRect(0,0, this.map.width*this.map.tileSize, this.map.height*this.map.tileSize);
			this.shadow.endFill();

			this.shadowContainer.addChild(this.shadow);
			this.shadowTexture = new PIXI.RenderTexture(this.map.width*this.map.tileSize, this.map.height*this.map.tileSize);
			this.shadowSprite = new PIXI.Sprite(this.shadowTexture);
			this.shadowSprite.blendMode = PIXI.blendModes.MULTIPLY;
			//this.state.mapContainer.mask = this.fog;
			this.container.addChild(this.fog);
			this.container.addChild(this.shadowSprite);

			//*
			this.map.lights.forEach(function(light){
				lightSprite = new PIXI.Sprite.fromFrame(light.type + '-0');
				lightSprite.position.x = light.tx - lightSprite.width/2;
				lightSprite.position.y = light.ty - lightSprite.height/2;
				if (light.tint){
					lightSprite.tint = light.tint
				}
				lightSprite.blendMode = PIXI.blendModes.ADD;
				this.shadowContainer.addChild(lightSprite);
			}.bind(this));
			//*/
			//
			//
		},
		updateLightMap: function(){
			return;
			if (this._lightUpdated){
				
			}
			this._lightUpdated = true;
			var pct = this.map.getTileAtPos(this.state.pc.xform.tx,this.state.pc.xform.ty);
			if (pct.data.blocker){
				pct = this.map.getTile(pct.x, pct.y-1)
			}

			this.fog.clear()
			if (!pct.data.blocker){
				while (!pct.data.blocker){
					pct = this.map.getTile(pct.x, pct.y - 1);
				}
				var vertexs = this.map.traceContour([pct.x,pct.y], 'blocker')	
				console.log('VERTEXS:', vertexs)
				if (vertexs.length>0){
					this.fog.beginFill(0x000000);
					this.fog.moveTo(vertexs[0][0], vertexs[0][1]);
					var last = vertexs[0];
					for (var i = 1; i < vertexs.length; i++) {
						var vert = vertexs[i];
						this.fog.lineTo(vert[0],vert[1]);
					}
					this.fog.lineTo(vertexs[0][0],vertexs[0][1]);
					this.fog.endFill();
				}		
			}

			this.fog.endFill();

			//*
			this.fog.beginFill(0xFF0000);
			this.map.getTiles().forEach(function(t){
				if (t.data.blocker){
					this.fog.drawRect(t.x * this.map.tileSize, t.y*this.map.tileSize, this.map.tileSize, this.map.tileSize);
				}
			}.bind(this));
			//*/
			this.fog.endFill();
		},
		addLight: function(entity){
			var sprite = lightSprite = new PIXI.Sprite.fromFrame(entity.light.type + '-0');
			sprite.position.x = entity.xform.tx  - sprite.width/2;
			sprite.position.y = entity.xform.ty  - sprite.height/2;
			sprite.blendMode = PIXI.blendModes.ADD;
			sprite.mask = this.fog;
			this.shadowContainer.addChild(sprite);
			this._lights[entity.id] = sprite;
			return sprite
		},
		_foo: true,
		tick: function(delta, entities){
			this.updateLightMap();
			/*
			this.map.getTiles().forEach(function(t){
				t.data.visible=false;
			});
			*/

			//Get Tile Player is On.
			

			//Determin if current tile can block vis, and fill with visibility from current pos.

			//*/
			/*
			this.fog.clear();
			this.fog.beginFill(0x000000);
			this.map.getTiles().forEach(function(t){
				if (t.data.fow || (!t.data.visible&&!t.data.canopy)){
					this.fog.drawRect(t.x * this.map.tileSize, t.y*this.map.tileSize, this.map.tileSize, this.map.tileSize);
				}
			}.bind(this));
			this.fog.endFill();
			//*/
			//*
			
			//*/
			
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.light){
					if (this._lights[entity.id]===undefined){
						this.addLight(entity);
					}
					var _intensity = entity.light.intensity;
					var sprite = this._lights[entity.id];
					if (entity.light.strobe>0){
						if (entity.light._life==undefined){
							entity.light._life = 0;
						}
						entity.light._life += delta;
						_intensity = Math.abs(Math.sin(entity.light._life*entity.light.strobe)) * _intensity;
						
					}
					if (entity.light.n_freq){
						_intensity = ((noise.perlin2(this.state._time*entity.light.n_freq,0)/2 + 0.5) * entity.light.n_amp) + entity.light.intensity * (1 - entity.light.n_amp);
						//console.log(_intensity,this.state._time)
					}

					sprite.position.x = entity.xform.tx   - sprite.width/2 + entity.light.offsetx;
					sprite.position.y = entity.xform.ty   - sprite.height/2 + entity.light.offsety;
					sprite.tint = entity.light.tint;
					sprite.alpha = _intensity;
					var tile = this.map.getTileAtPos(entity.xform.tx, entity.xform.ty);
					sprite.visible = entity.light.enabled && tile.data.visible;
					
				}
			};
		},
		render: function(){
			this.shadowTexture.render(this.shadowContainer);
		},
		lightFillScanline: function(x, y, width, height, diagonal, test, paint) {
			    // xMin, xMax, y, down[true] / up[false], extendLeft, extendRight
				var ranges = [[x, x, y, null, true, true]];
				paint(x, y);

				while(ranges.length) {
					var r = ranges.pop();
					var down = r[3] === true;
					var up =   r[3] === false;
				
					// extendLeft
					var minX = r[0];
					var y = r[2];
					if(r[4]) {
						while(minX>0 && test(minX-1, y)) {
							minX--;
							paint(minX, y);
						}
					}
					var maxX = r[1];
					// extendRight
					if(r[5]) {
						while(maxX<width-1 && test(maxX+1, y)) {
							maxX++;
							paint(maxX, y);
						}
					}
				
					if(diagonal) {
						// extend range looked at for next lines
						if(minX>0) minX--;
						if(maxX<width-1) maxX++;
					}
					else {
						// extend range ignored from previous line
						r[0]--;
						r[1]++;
					}
				
					function addNextLine(newY, isNext, downwards) {
						var rMinX = minX;
						var inRange = false;
						for(var x=minX; x<=maxX; x++) {
							// skip testing, if testing previous line within previous range
							var empty = (isNext || (x<r[0] || x>r[1])) && test(x, newY);
							if(!inRange && empty) {
								rMinX = x;
								inRange = true;
							}
							else if(inRange && !empty) {
								ranges.push([rMinX, x-1, newY, downwards, rMinX==minX, false]);
								inRange = false;
							}
							if(inRange) {
								paint(x, newY);
							}
							// skip
							if(!isNext && x==r[0]) {
								x = r[1];
							}
						}
						if(inRange) {
							ranges.push([rMinX, x-1, newY, downwards, rMinX==minX, true]);
						}
					}
				
					if(y<height)
						addNextLine(y+1, !up, true);
					if(y>0)
						addNextLine(y-1, !down, false);
				}
			},
	})
	return LightSystem;
})