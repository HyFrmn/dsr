define(['sge','./core'], function(sge, core, Entity){
	var InventoryTradeState = core.DSRState.extend({
		init: function(game, options){
                this._super(game, options);
                this.bg = new PIXI.Graphics();
				this.bg.beginFill(0x050B2B);
                this.bg.drawRect(0,0, 600, 300);
                this.container = new PIXI.DisplayObjectContainer();
                this.container.addChild(this.bg);
                this.container.position.x = 165;
                this.container.position.y = 120;
            },
            startState: function(data){
            	var entityA = data[0];
            	var entityB =data[1]
            	this.gameState = this.game.getState('game');
                this.stage = this.gameState.stage;
                this.stage.addChild(this.container);

                this.entityALabel = new PIXI.BitmapText('[' + entityA.name + ']', {font: '18px tahoma', align: 'right'});
                this.entityBLabel = new PIXI.BitmapText('[' + entityB.name + ']', {font: '18px tahoma', align: 'right'});
                
                this.entityALabel.position.x = 10;
                this.entityALabel.position.y = 10;

                this.entityBLabel.position.x = 310;
                this.entityBLabel.position.y = 10;

                this.closeLabel =  new PIXI.BitmapText('[CLOSE]', {font: '18px tahoma', align: 'right'});
                this.closeLabel.position.x = 300 - this.closeLabel.textWidth/2;
                this.closeLabel.position.y = 260;

                this.container.addChild(this.entityALabel);
                this.container.addChild(this.entityBLabel);
                this.container.addChild(this.closeLabel);
            
                var itemsA = entityA.inventory.items;
                for (var i = itemsA.length - 1; i >= 0; i--) {
                	var item = itemsA[i];

                };

                var itemsB = entityB.inventory.items;
                for (var i = itemsB.length - 1; i >= 0; i--) {
                	var item = itemsB[i];
                	 
                };
            },
            endState: function(){
                this.gameState = null;
                this.stage.removeChild(this.container);
                this.stage = null;
            },
            tick: function(delta){
                if (this.input.isPressed('space')){
                    this.game.changeState('game');
                }
            },
            render: function(delta){
           
                //Actually Render The Screen
                this._super(delta);
                
            }
	})

	var InventorySystem = core.DSRSystem.extend({
		setup: function(){
		
		},
		tick: function(delta, entities){
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.inventory!=null){

				}			
			};	
		},
		trade: function(entityA, entityB){
			console.log('Trade:', entityA, entityB);
			var game = this.state.game;
			game.setStateClass('trade', InventoryTradeState);
			game.createState('trade');
			game.changeState('trade', [entityA, entityB]);
		},
	})
	return InventorySystem;
})