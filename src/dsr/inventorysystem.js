define(['sge','./core'], function(sge, core, Entity){
    var Item = sge.Class.extend({
        init: function(data){
            this.type = data.type;
            this.label = data.label;
            this.value = data.value;
            this.desc = data.desc;
        }
    });

    var VisualItemProxy = sge.Class.extend({
        init: function(item, count){
            this.item = item;
            this.count = count;
            this.container = new PIXI.DisplayObjectContainer();
            this.labelText = new PIXI.BitmapText(item.label, {font: '18px tahoma', align: 'right'});
            this.labelText.position.x = 5;
            this.countText = new PIXI.BitmapText('x'+this.count, {font: '18px tahoma', align: 'right'});
            this.countText.position.x = 245 - this.countText.textWidth;
            this.container.addChild(this.labelText);
            this.container.addChild(this.countText);
        },
        update: function(){
            this.countText.setText('x' + this.count);
        }
    })

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

                this._currentIndex = 0;
            },
            startState: function(data){
            	var entityA = data[0];
            	var entityB =data[1];
                this.entityA = entityA;
                this.entityB = entityB;
                if (entityA.inventory==undefined||entityB.inventory==undefined){
                    return;
                }
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
            
                this._proxiesA = [];
                this._proxiesB = [];

                this.itemAContainer = new PIXI.DisplayObjectContainer();
                this.container.addChild(this.itemAContainer);
                this.itemAContainer.position.x = 20;
                this.itemAContainer.position.y = 64;

                var itemsB = Object.keys(entityB.inventory.items);
                this.itemBContainer = new PIXI.DisplayObjectContainer();
                this.container.addChild(this.itemBContainer);
                this.itemBContainer.position.x = 320;
                this.itemBContainer.position.y = 64;
                
                

                this.highlight = new PIXI.Graphics();
                this.highlight.lineStyle(2, 0xFFFFFF);
                this.highlight.drawRect(0,0,250,24)
                if (this._proxiesA.length>0){
                    this._aInvetory = true;
                    this.highlight.position.x = 20;
                    this.highlight.position.y = 64;
                } else {
                    this._aInvetory = false;
                    this.highlight.position.x = 320;
                    this.highlight.position.y = 64;// + this._proxiesB[0].container.position.y;
                }
                this.container.addChild(this.highlight);

                this.buildItemList();
            },
            endState: function(){
                this.gameState = null;
                this.stage.removeChild(this.container);
                this.stage = null;
            },
            update: function(){
                console.log(this._currentIndex, this._aInvetory)
                this.highlight.position.y = (this._currentIndex * 24) + 64;
                this.highlight.position.x = this._aInvetory ? 20 : 320;
            },
            tick: function(delta){
                if (this.input.isPressed('down')){
                    this._currentIndex++;
                    if (this._aInvetory){
                        if (this._currentIndex>=this._proxiesA.length){
                            this._currentIndex=0;
                        }
                    } else {
                        if (this._currentIndex>=this._proxiesB.length){
                            this._currentIndex=0;
                        }
                    }
                    this.update();
                }

                if (this.input.isPressed('up')){
                    this._currentIndex--;
                    if (this._aInvetory){
                        if (this._currentIndex<0){
                            this._currentIndex=Math.max(0, this._proxiesA.length-1);
                        }
                    } else {
                        if (this._currentIndex<0){
                            this._currentIndex=Math.max(0, this._proxiesB.length-1);
                        }
                    }
                    this.update();
                }

                if (this.input.isPressed('left') || this.input.isPressed('right')){
                    if (this._aInvetory){
                        this._aInvetory = false;
                        this._currentIndex = Math.max(0, Math.min(this._currentIndex, this._proxiesB.length-1));
                    } else {
                        this._aInvetory = true;
                        this._currentIndex = Math.max(0, Math.min(this._currentIndex, this._proxiesA.length-1));
                    }
                    this.update();
                }

                if (this.input.isPressed('enter')){
                    this.trade();
                }

                if (this.input.isPressed('escape')){
                    this.game.changeState('game');
                }
            },
            buildItemList: function(){
                this._proxiesA = [];
                this._proxiesB = [];
                
                var itemsA = Object.keys(this.entityA.inventory.items);
                var itemsB = Object.keys(this.entityB.inventory.items);
                
                while (this.itemAContainer.children.length>0){
                    this.itemAContainer.removeChild(this.itemAContainer.children[0]);
                }

                while (this.itemBContainer.children.length>0){
                    this.itemBContainer.removeChild(this.itemBContainer.children[0]);
                }
                for (var i = 0; i < itemsA.length; i++) {
                    var item = InventorySystem.GetItem(itemsA[i]);
                    var count = this.entityA.inventory.items[itemsA[i]];
                    var proxy = new VisualItemProxy(item, count);
                    proxy.container.position.y = i * 24;
                    this.itemAContainer.addChild(proxy.container);
                    this._proxiesA.push(proxy);
                };
                for (var i = 0; i < itemsB.length; i++) {
                    var item = InventorySystem.GetItem(itemsB[i]);
                    var count = this.entityB.inventory.items[itemsB[i]];
                    var proxy = new VisualItemProxy(item, count);
                    proxy.container.position.y = i * 24;
                    this.itemBContainer.addChild(proxy.container);
                    this._proxiesB.push(proxy);
                };
            },
            trade: function(){
                if (this._aInvetory){
                    var proxy = this._proxiesA[this._currentIndex];
                    proxy.count--;
                    this.entityA.inventory.items[proxy.item.type] = proxy.count;
                    if (proxy.count<=0){
                        delete this.entityA.inventory.items[proxy.item.type];
                    }
                    if ( this.entityB.inventory.items[proxy.item.type]==undefined){
                         this.entityB.inventory.items[proxy.item.type]=1
                    } else {
                         this.entityB.inventory.items[proxy.item.type]++
                    }
                } else {
                    var proxy = this._proxiesB[this._currentIndex];
                    proxy.count--;
                    this.entityB.inventory.items[proxy.item.type] = proxy.count;
                    if (proxy.count<=0){
                        delete this.entityB.inventory.items[proxy.item.type];
                    }
                    if ( this.entityA.inventory.items[proxy.item.type]==undefined){
                         this.entityA.inventory.items[proxy.item.type]=1
                    } else {
                         this.entityA.inventory.items[proxy.item.type]++
                    }
                }

                this.buildItemList();
                if (this._aInvetory){
                    if (this._proxiesA.length<1){
                        this._aInvetory=false;
                        this._currentIndex = 0;
                    } else {
                        this._currentIndex = Math.min(this._currentIndex, this._proxiesA.length-1);
                    }
                } else {
                    if (this._proxiesB.length<1){
                        this._aInvetory=true;
                        this._currentIndex = 0;
                    } else {
                        this._currentIndex = Math.min(this._currentIndex, this._proxiesB.length-1);
                    }
                }
                this._currentIndex = Math.max(0, this._currentIndex);
                this.update();
            },
            render: function(delta){
           
                //Actually Render The Screen
                this._super(delta);
                
            }
	});

	var InventorySystem = core.DSRSystem.extend({
		setup: function(){
		
		},
        addEntity: function(e){

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
    InventorySystem._items = {};
    InventorySystem.GetItem = function(item){
        return InventorySystem._items[item];
    }
    InventorySystem.load = function(data){
        var keys = Object.keys(data);
        keys.forEach(function(key){
            data[key].type = key;
            InventorySystem._items[key] = new Item(data[key]);
            console.log('Add Item', key)
        });
    }
    core.addLoadCallback(function(loader, manifest, promises){
        console.log('Load Items')
        if (manifest.items){
            manifest.items.forEach(function(url){
                (loader.loadJSON(url).then(InventorySystem.load));
            });
        }
    })
	return InventorySystem;
})