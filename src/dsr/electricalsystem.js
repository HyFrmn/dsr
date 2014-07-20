define(['sge','./core'], function(sge, core, Entity){
	var ElectricalSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this.network =  {};
			this.connections = [];

			this.container = new PIXI.DisplayObjectContainer();
			this.state.mapContainer.addChild(this.container);

			this._selecting = false;
			this._activeConnection = null;
		},
		tick: function(delta, entities){
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.electrical!=undefined&&entity.electrical.connections!=undefined){
					if (entity==this._activeConnection){
						entity.electrical.node.tint = 0x00FF00;
					} else if(entity.electrical.on) {
						entity.electrical.node.tint = 0xFF9966;
					} else if (entity.electrical.connections.length>0){
						entity.electrical.node.tint = 0xFFFFFF;
					} else {
						entity.electrical.node.tint = 0x333333;
					}
				}
			}
		},
		activate: function(entity){
			if (this._selecting){
				if (entity==this._activeConnection){
					this._selecting = false;
					this._activeConnection=null;
					this.activateNode(entity);
					return
				}
				if (this.network[this._activeConnection.id][entity.id]!=undefined){
					if (this._activeConnection.electrical.connections.indexOf(entity)<0){
						//Illuminate Wire
						var connection = this.network[this._activeConnection.id][entity.id];
						connection.wire.tint = 0xFFFFFF
						this._activeConnection.electrical.connections.push(entity);
						entity.electrical.connections.push(this._activeConnection);
					} else {
						this.disconnect(this._activeConnection, entity);
					}
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
		disconnect: function(a, b){
			a.electrical.connections.splice(a.electrical.connections.indexOf(b), 1);
			b.electrical.connections.splice(b.electrical.connections.indexOf(a), 1);
			var connection = this.network[a.id][b.id];
			connection.wire.tint=0x333333;
		},
		clearConnections: function(entity){
			entity.electrical.connections.forEach(function(child){
				this.disconnect(entity, child);
			})
		},
		activateNode: function(entity){
			var data = this.network[entity.id];
			var node = data.node;
			if (entity.electrical.active){
				entity.electrical.active=false;
				
			} else {
				entity.electrical.active=true;
			}
		},
		addNode: function(e){
			console.log(e.id, this.network)
			if (this.network[e.id]==undefined){
				if (e.electrical.connections==undefined){
					e.electrical.connections=[]
				}
				var data = {};
				
				var color = 0xFFFFFF;
				var node = new PIXI.Graphics();
				node.beginFill(color);
				node.drawCircle(0,0,6);
				node.position.x = e.xform.tx;
				node.position.y = e.xform.ty - 66;
				node.tint = 0x333333;
				this.container.addChild(node);
			
				e.electrical.node = node;
				e.on('interact.action', function(){
					this.activate(e);
				}.bind(this))
				data.node = node;
				this.network[e.id] = data;
				console.log('Netorked', e.id)
			}
		},
		createConnection: function(a, b){
			this.addNode(a);
			this.addNode(b);
			
			var wire = new PIXI.Graphics();
			dx = b.xform.tx - a.xform.tx;
			dy = b.xform.ty - a.xform.ty;
			var color = 0xFFFFFF;
			wire.lineStyle(2, color,1);
			wire.moveTo(0,0)
			wire.lineTo(dx,dy);
			wire.position.x = a.xform.tx;
			wire.position.y = a.xform.ty - 66;
			wire.tint = 0x333333;
			this.container.addChild(wire);

			var connection = {
				wire : wire,
				dx: dx,
				dy: dy
			}

			this.network[b.id][a.id] = connection
			this.network[a.id][b.id] = connection
			
			console.log('Connected', dx, dy)
		},
		render: function(){

		},
		turnOn: function(e, activated){
			if (activated==null){
				activated=[]
			}
			if (!e.electrical.on && activated.indexOf(e)<0){
				activated.push(e)
				e.trigger('electrical.on');
				e.electrical.on = true;
				e.electrical.connections.forEach(function(c){
					this.network[e.id][c.id].wire.tint = 0xFF9966;
					this.turnOn(c, activated);
				}.bind(this))
			}
		},
		turnOff: function(e, activated){
			if (activated==null){
				activated=[]
			}
			if (e.electrical.on && activated.indexOf(e)<0){
				activated.push(e)
				e.trigger('electrical.off');
				e.electrical.on = false;
				e.electrical.connections.forEach(function(c){
					this.network[e.id][c.id].wire.tint = 0xFFFFFF;
					this.turnOff(c, activated);
				}.bind(this))
			}
		}
	})
	return ElectricalSystem;
})