define(['sge','./core'], function(sge, core, Entity){
	var LightSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);

			this.shadowContainer = new PIXI.DisplayObjectContainer();

			this.fog = new PIXI.Graphics();
			
			
		},
		setup: function(){
			this.map = this.state.getSystem('map');

			this.shadow = new PIXI.Graphics();
			this.shadow.beginFill(0x333333);
			this.shadow.drawRect(0,0, this.map.width*this.map.tileSize, this.map.height*this.map.tileSize);
			this.shadow.endFill();

			this.shadowContainer.addChild(this.shadow);
			this.shadowTexture = new PIXI.RenderTexture(this.map.width*this.map.tileSize, this.map.height*this.map.tileSize);
			this.shadowSprite = new PIXI.Sprite(this.shadowTexture);
			this.shadowSprite.blendMode = PIXI.blendModes.MULTIPLY;
			//this.shadowSprite.mask = map.canopyMask;
			this.container.addChild(this.fog);
			this.container.addChild(this.shadowSprite);

			this.flashLight = new PIXI.Sprite.fromFrame('flashlight_basic-0');
			//this.flashLight.scale.x = 2;
			//this.flashLight.scale.y = 2;
			this.flashLight.blendMode = PIXI.blendModes.ADD;
			this.shadowContainer.addChild(this.flashLight)
			//*
			this.map.lights.forEach(function(light){
				lightSprite = new PIXI.Sprite.fromFrame('point_small-0');
				lightSprite.position.x = light.tx;
				lightSprite.position.y = light.ty;
				if (light.tint){
					lightSprite.tint = light.tint
				}
				lightSprite.blendMode = PIXI.blendModes.ADD;
				this.shadowContainer.addChild(lightSprite);
			}.bind(this));
			//*/
		},
		_foo: true,
		tick: function(delta, entities){
			this.map.getTiles().forEach(function(t){
				t.data.visible=false;
			});

			var pct = this.map.getTileAtPos(this.state.pc.xform.tx,this.state.pc.xform.ty);
			if (pct.data.blocker){
				pct = this.map.getTile(pct.x, pct.y+1)
			}
			if (!pct.data.blocker){
				this._foo = false;
				this.lightFillScanline(
					Math.floor(this.state.pc.xform.tx/32),
					Math.floor(this.state.pc.xform.ty/32),
					this.map.width,
					this.map.height-1,
					false,
					function(x, y){
						var t= this.map.getTile(x,y);
							
						if (t){
							if ((((t.x-pct.x)*(t.x-pct.x)+(t.y-pct.y)*(t.y-pct.y)))<64){
								if (t.data.fow){
									t.data.fow = false;
								}
							}
							return !t.data.blocker;
						} else {

							console.log('Light Fill Error:', x, y)
						}
					}.bind(this),
					function(x, y){
						var t= this.map.getTile(x,y);
						if (t){
							t.data.visible=true;
						} else {
							console.log('Light Fill Error:', x, y)
						}
					}.bind(this)
				);
			}

			//*
			this.map.getTile(pct.x,pct.y).data.fow = false;
			var rad = 4;
			for (var dx = -rad; dx < rad+1; dx++) {
				for (var dy = -rad; dy < rad+1; dy++) {
					dist = (dx*dx)+(dy*dy);
					if (dist<(rad*rad)){
						var tile = this.map.getTile(pct.x+dx,pct.y+dy);
						if (tile){
							if (tile.data.blocker){
								tile.data.fow = false;
							}
						}
					}
				}
			}
			//*/
			this.fog.clear();
			this.fog.beginFill(0x000000);
			this.map.getTiles().forEach(function(t){
				if (t.data.fow || (!t.data.visible&&!t.data.canopy)){
					this.fog.drawRect(t.x * this.map.tileSize, t.y*this.map.tileSize, this.map.tileSize, this.map.tileSize);
				}
			}.bind(this));
			this.fog.endFill();
			/*
			this.fog.beginFill(0xFF0000);
			this.map.getTiles().forEach(function(t){
				if (t.data.blocker){
					this.fog.drawRect(t.x * this.map.tileSize, t.y*this.map.tileSize, this.map.tileSize, this.map.tileSize);
				}
			}.bind(this));
			//*/
			this.fog.endFill();
			this.flashLight.position.x = this.state.pc.xform.tx - 128;
			this.flashLight.position.y = this.state.pc.xform.ty - 128;
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