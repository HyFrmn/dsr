DEBUG=0;
define([
		'sge',
		'./core', 
		'./entity',
		'./rendersystem',
		'./mapsystem',
		'./controlsystem',
		'./physicssystem',
		'./lightsystem',
		'./interactsystem',
		'./scriptsystem',
		'./hudsystem',
		'./connectionsystem',
		'./inventorysystem',
		'./animationsystem',
		'./electricalsystem',
		'./particlesystem',
		'./survivalsystem'
	], 
	function(   sge,
				core,
				Entity,
				RenderSystem,
				MapSystem,
				ControlSystem,
				PhysicsSystem,
				LightSystem,
				InteractSystem,
				ScriptSystem,
				HudSystem,
				ConnectionSystem,
				InventorySystem,
				AnimationSystem,
				ElectricalSystem,
				ParticleSystem,
				SurvivalSystem){
	
	var PlayState = core.DSRState.extend({
		STAGE_COLOR: 0x000000,
		init: function(game, options){
			this._super(game, options);
			this._eid = 1;
			this._entities = {};
			this._entityNames = {};
			this._tagged = {}
			this._systems = {};
			this._systemNames = [];
			//Intialize Game Play Graphics
			this.mapContainer = new PIXI.DisplayObjectContainer();
			this.hudContainer = new PIXI.DisplayObjectContainer();
			this.stage.addChild(this.mapContainer);
			
			console.log('Added Containers!!')
			//Initialize System
			this.addSystem('control', ControlSystem);
			this.addSystem('map', MapSystem);
			this.addSystem('interact', InteractSystem);
			this.addSystem('script', ScriptSystem);			
			this.addSystem('physics', PhysicsSystem);
			this.addSystem('render', RenderSystem);
			this.addSystem('particle', ParticleSystem);
			this.addSystem('light', LightSystem);
			this.addSystem('hud', HudSystem);
			this.addSystem('connection', ConnectionSystem);
			this.addSystem('inventory', InventorySystem);
			this.addSystem('animation', AnimationSystem);
			this.addSystem('electrical', ElectricalSystem);
			this.addSystem('survival', SurvivalSystem);
			
			
			//Chain Startup
			console.log('Load Map:', options);
			this.getSystem('map').load('content/levels/' + options.map +'.json').then(this.startGame.bind(this));

		},
		startGame: function(){
			var systems = this._systemNames;
			for (var i = systems.length - 1; i >= 0; i--) {
				console.log(systems[i])
				this._systems[systems[i]].setup();
			};
            console.log('Start Game!');
			this.game.changeState('game');
		},
		addSystem: function(type, klass){
			this._systems[type] = new klass(this);
			this._systemNames.splice(0,0,type);
			return this._systems[type];
		},
		getSystem: function(type){
			return this._systems[type];
		},
		addEntity: function(entity){
			entity.id = this._eid++;
			this._entities[entity.id] = entity;
			if (entity.name){
				this._entityNames[entity.name] = entity;
			}
			var systems = this._systemNames;
			for (var i = systems.length - 1; i >= 0; i--) {
				this._systems[systems[i]].addEntity(entity);
			};
			if (entity.tags){
				for (var q = entity.tags.length - 1; q >= 0; q--) {
					var tag = entity.tags[q];
					if (this._tagged[tag]==undefined){
						this._tagged[tag] = [];
					}
					this._tagged[tag].push(entity);
				};
			}
			return entity;
		},
		findEntities: function(){
			return Object.keys(this._entities).map(function(k){return this._entities[k]}.bind(this))
		},
		startState: function(){
			this.stage.addChild(this.hudContainer);
		},
		endState: function(){
			this.stage.removeChild(this.hudContainer);
		},
		getEntity: function(name){
			return this._entities[name];
		},
		getEntityByName: function(name){
			return this._entityNames[name];
		},
		getEntitiesByAABB: function(x, y, width, height){
			var results = [];
			var physics = this.getSystem('physics');
			physics.space.bbQuery(new cp.BB(x-width/2,y-height/2,x+width/2,y+height/2),
									physics.ENTITY_LAYER,
									null,
									function(shape){
										results.push(shape.entity)
									})
		
			return results;
		},
		getTagged: function(tag){
			return this._tagged[tag]
		},
		removeEntity: function(){

		},
		startCutscene: function(data){
			this.game.changeState('cutscene', data);
		},
		render: function(delta){
			var systems = this._systemNames;
			for (var i = systems.length - 1; i >= 0; i--) {
				this._systems[systems[i]].render(delta);
			};
			this._super(delta);
		},
		getEntities: function(){
			var entities = Object.keys(this._entities).map(function(key){
			    return this._entities[key];
			}.bind(this));
			return entities;
		},
		tick: function(delta){
			this._super(delta);
			var entities = Object.keys(this._entities).map(function(key){
			    return this._entities[key];
			}.bind(this));
			var systems = this._systemNames;
			for (var i = systems.length - 1; i >= 0; i--) {
				//console.log(systems[i], delta)
				this._systems[systems[i]].tick(delta, entities);
			};
		}
	})
	return {PlayState: PlayState};
})