define(['sge','./core','./entity'], function(sge, core, Entity){
	function componentToHex(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}	

	function rgbToHex(r, g, b) {
	    return componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	var Tile = sge.Class.extend({
		init: function(x, y){
			this.x = x;
			this.y = y;
			this.data = {
				visible: true,
				fow:    false,
				passable: true,
				blocker: false
			},
			this.layers = {
				base: 0
			}
		}
	});

	var MapSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this.tileSize = 32;
			this.tiles = [];
			this.lights = [];
			this.chunk = {}
			this._chunkSize = 1024;

			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);

		},
		createMap: function(level_data){

			var layerData = {};
			level_data.layers.forEach(function(layer){
				layerData[layer.name] = layer;
			});
			this.width = level_data.width;
			this.height = level_data.height;
			var canopyMask = new PIXI.Graphics();
			canopyMask.beginFill(0x000000);
			var layerMask = new PIXI.Graphics();
			layerMask.beginFill(0x000000);
			var x = 0;
			var y = 0;
			var total = (this.width * this.height);

			for (var i = total -1; i >= 0; i--) {
				var tile = new Tile(x, y);
				tile.layers.base = -1;
				this.tiles.push(tile);
				var mapIdx = this.getIndex(x,y);
				tile.layers.base = layerData.base.data[mapIdx]-1;
				var idx = layerData.layer0.data[mapIdx]-1;
				if (idx>=0){
					tile.layers.layer0 = idx;
				} else {
					layerMask.drawRect(tile.x * this.tileSize, tile.y * this.tileSize, this.tileSize, this.tileSize);
				}
				idx = layerData.layer1.data[mapIdx]-1;
				if (idx>=0){
					tile.layers.layer1 = idx;
				}


				var cidx = layerData.canopy.data[mapIdx]-1;
				if (cidx>=0){
					tile.layers.canopy = cidx;
				}
				tile.data.passable = layerData.terrain.data[mapIdx]==0;
				tile.data.blocker = layerData.canopy.data[mapIdx]!=0;
				tile.data.canopy = layerData.canopy.data[mapIdx]!=0;
				if (tile.x==0||tile.y==0||tile.x==this.width-1||tile.y==this.height-1){
					tile.data.passable = false;
					//tile.data.blocker = true;
					tile.layers.base=25;
				}
				if (!tile.data.canopy){
					canopyMask.drawRect(tile.x * this.tileSize, tile.y * this.tileSize, this.tileSize, this.tileSize);
				}
				x++;
				if (x>=this.width){
					x=0;
					y++;
				}
			}

			canopyMask.endFill();
			this.canopyMask = canopyMask;
			this.layerMask = layerMask;
			this.container.addChild(canopyMask);
			this.container.addChild(layerMask);
			if (layerData.lights){
				layerData.lights.objects.forEach(function(light){
					var type = light.type;
					var tx = light.x + light.width/2;
					var ty = light.y + light.height/2;
					var data = {
						xform: {
							tx: tx,
							ty: ty
						},
						light: {
							type: type
						}
					}//{type: type, tx: tx, ty: ty};
					if (light.properties.tint){
						data.light.tint = parseInt(light.properties.tint, 16);
					}
					if (light.properties.strobe){
						data.light.strobe = parseInt(light.properties.strobe, 10);
					}
					if (light.properties.enabled){
						data.light.enabled = eval(light.properties.enabled)
					}
					var entity = new Entity('light', data);
					entity.name = light.name;
					entity.tags = [light.name];
					this.state.addEntity(entity);
				}.bind(this))
			}

			this.preRender();
			if (layerData.entities){
				layerData.entities.objects.forEach(function(entity_data){
					
					if (!Entity._data[entity_data.type]){
						console.error('Nothing found for Entity:', entity_data.type);
                return
					}
					var props = {
						xform: {
							tx: (entity_data.x + this.tileSize/2),
							ty: (entity_data.y - this.tileSize/2)
						}
					};
					var ks = Object.keys(entity_data.properties);
					for (var i = ks.length - 1; i >= 0; i--) {
						var key = ks[i];

						var subdata = key.split('.');
						if (props[subdata[0]]==undefined){
							props[subdata[0]]={};
						}
						props[subdata[0]][subdata[1]] = eval(entity_data.properties[key]);
					};
					var entity = new Entity(entity_data.type, props);
					entity.name = entity_data.name;
					if (entity_data.type=='pc'){
						this.state.pc = entity;
					}

					this.state.addEntity(entity)
				}.bind(this))
			}

			var outline = new PIXI.Graphics();
			//this.container.addChild(outline);
			outline.lineStyle(2, 0xFF0000);
			//Trace Map
			
			//Find Start Pixel
			var start = null;
			var x = 1;
			var y = 1;
			while (!start){
				if (this.getTile(x, y).data.passable){
					start = [x-1,y-1];
				}
				x+=1
				if (x>=this.width){
					x=0;
					y+=1;
					if (y>=this.height){
						break;
					}
				}
			}
			
			//Trace
			var tracing = true;
			var pos = start;
			var vertexs = [];
			while (tracing){
				var kernal = [[this.getTile(pos[0], pos[1]).data.passable ? 1 : 0,
								this.getTile(pos[0]+1, pos[1]).data.passable ? 1 : 0],[
								this.getTile(pos[0], pos[1]+1).data.passable ? 1 : 0,
								this.getTile(pos[0]+1, pos[1]+1).data.passable ? 1 : 0]]
				var composite = kernal[0][0] + kernal[0][1]*2 + kernal[1][0]*4 + kernal[1][1]*8;
				if (composite==8||composite==12||composite==13){
					vertexs.push([(pos[0]+1)*32,(pos[1]+1)*32])
					pos = [pos[0]+1,pos[1]]
				} else if(composite==4||composite==5||composite==7){
				 	vertexs.push([(pos[0]+1)*32,(pos[1]+1)*32])
					pos = [pos[0],pos[1]+1]
				} else if (composite==1||composite==3||composite==11){ 
					vertexs.push([(pos[0]+1)*32,(pos[1]+1)*32])
					pos = [pos[0]-1,pos[1]]
				} else if (composite==2 || composite==10 || composite==14){ 
					vertexs.push([(pos[0]+1)*32,(pos[1]+1)*32])
					pos = [pos[0],pos[1]-1]
				}
				if (pos[0]==start[0]&&pos[1]==start[1]){
					break;
				}
			}
			this.terrainOutline = [];
			this.terrainOutline.push(vertexs[0]);
			var last = vertexs[0];
			var outlineScale=0.1;
			outline.moveTo(last[0]*outlineScale,last[1]*outlineScale);
			for (var i = 1; i < vertexs.length-1; i++) {
				var vert = vertexs[i];
				var next = vertexs[i+1];
				outline.lineTo(vert[0]*outlineScale,vert[1]*outlineScale);
				if (!(next[0]==last[0]||next[1]==last[1])){
					this.terrainOutline.push(vert);
				}
				last = vert;
			}
			outline.lineTo(vertexs[0][0]*outlineScale,vertexs[0][1]*outlineScale);
			console.log('Vertexs:', vertexs.length, this.terrainOutline.length);
			//this.outline = outline;
		},
		load: function(url){
			var defered = new sge.When.defer();
			this.state.game.loader.loadJSON(url).then(function(data){
				this.createMap(data);
				if (data.properties.mission){
					this.state.game.loader.loadJS('content/missions/' + data.properties.mission + '.js', this.state, {state: this.state}).then(function(func){
						func();
						defered.resolve()
					});
				} else {
					defered.resolve();
				}
				
			}.bind(this));
			return defered.promise;
		},
		tick: function(delta){
			this.state.mapContainer.position.x = this.state.game.width/2 - this.state.pc.xform.tx;
			this.state.mapContainer.position.y = this.state.game.height/2 - this.state.pc.xform.ty;
		},
		getIndex : function(x, y){
            var index = (y * this.width) + x;
            if (x > this.width-1 || x < 0){
                return null;
            }
            if (y > this.height-1 || y < 0){
                return null;
            }
            return index;
        },
        getTile : function(x, y){
            return this.tiles[this.getIndex(x, y)] || null;
        },
        getTileAtPos : function(x, y){
        	return this.getTile(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize))
        },
        getTiles: function(){
        	return this.tiles.slice(0);
        },
        render: function(delta){
			if (!this._ready){
				return
			}
			var pixelWidth = this.width * this.tileSize;
			var pixelHeight = this.height * this.tileSize;
			var chunks = [Math.ceil(pixelWidth/this._chunkSize),Math.ceil(pixelHeight/this._chunkSize)];
			var startX = -this.state.mapContainer.position.x;
			var startY = -this.state.mapContainer.position.y;
			var endX = startX + this.state.game.width;
			var endY = startY + this.state.game.height;
			var scx = Math.floor(startX/this._chunkSize);
			var sex = Math.ceil(endX/this._chunkSize);
			var scy = Math.floor(startY/this._chunkSize);
			var sey = Math.ceil(endY/this._chunkSize);
			for (var x=0; x<chunks[0]; x++){
				for (var y=0; y<chunks[1]; y++){
					if ((x>=scx) && (x<= sex) &&  y>= scy && y<=sey){
						if (this.container.children.indexOf(this.chunk[x+'.'+y])<0){
							this.container.addChild(this.chunk[x+'.'+y]);
						}
					} else {
						if (this.container.children.indexOf(this.chunk[x+'.'+y])>=0){
							this.container.removeChild(this.chunk[x+'.'+y])
						}
					}
				}
			}
		},
		preRender : function(){
			var pixelWidth = this.width * this.tileSize;
			var pixelHeight = this.height * this.tileSize;
			var chunks = [Math.ceil(pixelWidth/this._chunkSize),Math.ceil(pixelHeight/this._chunkSize)];
			
			for (var x=0; x<chunks[0]; x++){
				for (var y=0; y<chunks[1]; y++){
					this.preRenderChunk(x, y);
				}
			}

			this._ready = true;
			this.render();

		},
		preRenderChunk: function(cx, cy){

			var startX = cx * this._chunkSize;
			var startY = cy * this._chunkSize;
			var endX = Math.min((cx + 1) * (this._chunkSize), this.width * this.tileSize);
			var endY = Math.min((cy + 1) * (this._chunkSize), this.height * this.tileSize);

			var chunkStartX = Math.floor(startX / this.tileSize);
			var chunkStartY = Math.floor(startY / this.tileSize);

			var chunkEndX = Math.ceil(endX / this.tileSize);
			var chunkEndY = Math.ceil(endY / this.tileSize);

			var chunk = new PIXI.DisplayObjectContainer();

			this.blocks = [];

			for (var x=chunkStartX; x<chunkEndX; x++){
				for (var y=chunkStartY; y<chunkEndY; y++){
					var tile = this.getTile(x, y);
					if (tile){
						if (tile.layers.base>=0){
							var sprite = new PIXI.Sprite.fromFrame('dsr_tiles-' + tile.layers.base);
							sprite.position.x = (x*this.tileSize) - startX;
							sprite.position.y = (y*this.tileSize) - startY;
							chunk.addChild(sprite);
						}
						if (tile.layers.layer0!==undefined){
							var sprite = new PIXI.Sprite.fromFrame('dsr_tiles-' + tile.layers.layer0);
							sprite.position.x = (x*this.tileSize) - startX;
							sprite.position.y = (y*this.tileSize) - startY;
							chunk.addChild(sprite);
						}
						if (tile.layers.layer1!==undefined){
							var sprite = new PIXI.Sprite.fromFrame('dsr_tiles-' + tile.layers.layer1);
							sprite.position.x = (x*this.tileSize) - startX;
							sprite.position.y = (y*this.tileSize) - startY;
							chunk.addChild(sprite);
						}
						if (tile.layers.canopy!==undefined){
							var sprite = new PIXI.Sprite.fromFrame('dsr_tiles-' + tile.layers.canopy);
							sprite.position.x = (x*this.tileSize) - startX;
							sprite.position.y = (y*this.tileSize) - startY;
							chunk.addChild(sprite);
						}
					}
				}
			}
			
			// render the tilemap to a render texture
			var texture = new PIXI.RenderTexture(endX-startX, endY-startY);
			texture.render(chunk);
			// create a single background sprite with the texture
			var background = new PIXI.Sprite(texture, {x: 0, y: 0, width: this._chunkSize, heigh:this._chunkSize});
			background.position.x = cx * this._chunkSize;
			background.position.y = cy * this._chunkSize;
			
			//console.log('Render Chunk:', cx, cy, tile.layers.base, background)
			this.chunk[cx+'.'+cy] = background;
		}
	})

	return MapSystem;
})