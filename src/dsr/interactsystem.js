define(['sge','./core', './entity'], function(sge, core, Entity){
	var PryOpenState = core.DSRState.extend({
		init: function(game, options){
                this._super(game, options);
                this.bg = new PIXI.Graphics();
				this.bg.beginFill(0x050B2B);
                this.bg.drawRect(0,0, 600, 30);
                this.bar = new PIXI.Graphics();
				this.bar.beginFill(0xFFFFFF);
                this.bar.drawRect(10,5, 580, 20);
                this.container = new PIXI.DisplayObjectContainer();
                this.text = new PIXI.BitmapText('Press [Spacebar] to pry open the door.', {font: '18px tahoma', align: 'right'});
            	this.text.position.x = 300 - this.text.textWidth/2;
            	this.text.position.y = 150;
            	this.container.addChild(this.text);
                this.container.addChild(this.bg);
                this.container.addChild(this.bar);
                this.container.position.x = 165;
                this.container.position.y = 120;



            },
            startState: function(data){
            	this.gameState = this.game.getState('game');
                this.stage = this.gameState.stage;
                this.stage.addChild(this.container);
                this._entity = data[0];
                this._value = 0;
                this._total = 40;
            },
            endState: function(){
                this.gameState = null;
                this.stage.removeChild(this.container);
                this.stage = null;
            },
            tick: function(delta){
                if (this.input.isPressed('space')){
                    this._value += 10;
                    if (this._value>=this._total){
                    	this._entity.trigger('pry.open');
	                    this.game.changeState('game');
	                }
                } else {
	                this._value = Math.max(0, this._value - (delta*20));
                }
                this.bar.clear();
				this.bar.beginFill(0xFFFFFF);
                this.bar.drawRect(10,5, Math.round(580*(this._value/this._total)), 20);
            },
            render: function(delta){
           
                //Actually Render The Screen
                this._super(delta);
                
            }
	})

	var InteractSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
			this._interactEntity = null;
			this._isInteracting = false;
			var game = state.game;
			game.setStateClass('pry', PryOpenState);
			game.createState('pry');
		},
		setup: function(){
			this.map = this.state.getSystem('map');
		},
		addEntity: function(e){
			if (e.interact){
				if (e.interact.toggle){
					var comp = e.interact.toggle.split('.')[0];
					var attr = e.interact.toggle.split('.')[1];
					e.on('interact', function(){
						console.log('Interact', e, comp, attr)
						e[comp][attr] = !e[comp][attr];
					});
				}
			}
		},
		tick: function(delta, entities){

			var tmp_dist = 1000000;
			var tmp_entity = null;
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.interact!==undefined){
					if (entity.highlight!==undefined && entity.interact.enabled){
						var dx = entity.xform.tx - this.state.pc.xform.tx;
						var dy = entity.xform.ty - this.state.pc.xform.ty;
						var dist = ((dx*dx)+(dy*dy));
						//console.log(dist);
						if (dist<(entity.interact.radius*entity.interact.radius)){
							if (dist<tmp_dist){
								tmp_dist = dist;
								tmp_entity = entity;
							}
						}
					}
				}
			}
			if (tmp_entity){
				if (tmp_entity!=this._interactEntity){
					if (this._interactEntity){
						this._interactEntity.highlight.visible = false;
						this._interactEntity.trigger('highlight.off');
					}
					tmp_entity.highlight.visible = true;
					 this._interactEntity = tmp_entity;
					this._interactEntity.trigger('highlight.on');
				} 
			} else {
				if (this._interactEntity){
					this._interactEntity.highlight.visible = false;
					this._interactEntity.trigger('highlight.off');
				}
				this._interactEntity = null;
			}

			
			if (this._interactEntity){
				if (this.state.input.isDown('space')){
					if (!this._isInteracting){
						this._isInteracting = true;	
						this._interactEntity.highlight.color = 0xFF0000;
						this._interactEntity.trigger('interact', this.state.pc);
					}
				} 
				if (this.state.input.isDown('A')){
					if (!this._isInteracting){
						this._isInteracting = true;	
						this._interactEntity.highlight.color = 0xFFFF00;
						this._interactEntity.trigger('interact.action', this.state.pc);
					}
				}
				if (!this.state.input.isDown('A') && !this.state.input.isDown('space')) {
					this._isInteracting = false;
					this._interactEntity.highlight.color = 0x0068E6;
				}
			}
		}
	})
	return InteractSystem;
})