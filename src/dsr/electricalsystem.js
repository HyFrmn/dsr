define(['sge','./core'], function(sge, core, Entity){
	var ElectricalSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this.connected = [];
			this.connections = [];
			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);

			this._selecting = false;
			this._activeConnection = null;
		},
		tick: function(delta, entities){
			/*
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.animation!==undefined){
					var track = entity.animation.frames[entity.animation.track];
					entity.animation.timeout-=delta;
					if (entity.animation.timeout<=0){
						entity.animation.timeout=1/15;
						entity.animation.frame++;
						if (entity.animation.frame>=track.length){
							entity.animation.frame=0;
						}
						entity.sprite.frame = track[entity.animation.frame];
					}
				}
			}
			*/
		},
		activate: function(entity){
			if (this._selecting){
				if (this._activeConnection.electrical.connections[entity.id]!=undefined){
					
					//Illuminate Wire
					var connection = this._activeConnection.electrical.connections[entity.id];
					var color = 0xFFFFFF;
					connection.wire.clear()
					connection.wire.lineStyle(2, color,1);
					connection.wire.moveTo(0,0)
					connection.wire.lineTo(connection.dx,connection.dy);
					console.log('Light Wire')

					this._selecting=false;
					this._activeConnection=null;
					this.activateNode(entity);
				} else {
					console.warn('No connection', this._activeConnection.id, entity.id)
				}
			} else {
				this._selecting = true;
				this._activeConnection = entity;
				this.activateNode(entity);
			}
		},
		activateNode: function(entity){
			node = entity.enode;
			if (entity.electrical.active){
				entity.electrical.active=false;
				node.clear()
				node.beginFill(0x333333);
				node.drawCircle(0,0,6);
			} else {
				entity.electrical.active=true;
				node.clear()
				node.beginFill(0xFFFFFF);
				node.drawCircle(0,0,6);
			}
		},
		createConnection: function(a, b){
			
			
			this.connections.push([a,b]);

			var graphics = new PIXI.Graphics();
			dx = b.xform.tx - a.xform.tx;
			dy = b.xform.ty - a.xform.ty;
			var color = 0x333333;
			graphics.lineStyle(2, color,1);
			graphics.moveTo(0,0)
			graphics.lineTo(dx,dy);
			graphics.position.x = a.xform.tx;
			graphics.position.y = a.xform.ty - 66;
			this.container.addChild(graphics);

			if (this.connected.indexOf(a)<0){
				if (a.electrical.connections==undefined){
					a.electrical.connections={}
				}
				this.connected.push(a);
				var node_a = new PIXI.Graphics();
				node_a.beginFill(color);
				node_a.drawCircle(0,0,6);
				node_a.position.x = a.xform.tx;
				node_a.position.y = a.xform.ty - 66;
				this.container.addChild(node_a);
			
				a.enode = node_a;
				a.on('interact.action', function(){
					this.activate(a);
				}.bind(this))
			}


			if (this.connected.indexOf(b)<0){
				if (b.electrical.connections==undefined){
					b.electrical.connections={}
				}
				this.connected.push(b);
				var node_b = new PIXI.Graphics();
				node_b.beginFill(color);
				node_b.drawCircle(0,0,6);
				node_b.position.x = b.xform.tx;
				node_b.position.y = b.xform.ty - 66;
				this.container.addChild(node_b);
			
				b.enode = node_b;
				b.on('interact.action', function(){
					this.activate(b);
				}.bind(this))
			}
			var connection = {
				wire : graphics,
				dx: dx,
				dy: dy
			}
			a.electrical.connections[b.id] = connection
			b.electrical.connections[a.id] = connection
			
			console.log('Connected', dx, dy)
		},
		render: function(){

		}
	})
	return ElectricalSystem;
})