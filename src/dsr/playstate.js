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
		'./scriptsystem'
	], 
	function(sge, core, Entity, RenderSystem, MapSystem, ControlSystem, PhysicsSystem, LightSystem, InteractSystem, ScriptSystem){
	
	var PlayState = core.DSRState.extend({
		STAGE_COLOR: 0x000000,
		init: function(game, options){
			this._super(game, options);
			this._eid = 1;
			this._entities = {};
			this._systems = {};
			this._systemNames = [];
			//Intialize Game Play Graphics
			this.mapContainer = new PIXI.DisplayObjectContainer();
			this.hudContainer = new PIXI.DisplayObjectContainer();
			this.stage.addChild(this.mapContainer);
			this.stage.addChild(this.hudContainer);
			console.log('Added Containers!!')
			//Initialize System
			this.addSystem('control', ControlSystem);
			this.addSystem('map', MapSystem);
			this.addSystem('interact', InteractSystem);
			this.addSystem('script', ScriptSystem);			
			this.addSystem('physics', PhysicsSystem);
			this.addSystem('render', RenderSystem);
			this.addSystem('light', LightSystem);
			
			//Chain Startup
			this.getSystem('map').load('content/levels/tech_demo_a.json').then(this.startGame.bind(this));

		},
		startGame: function(){
			var systems = this._systemNames;
			for (var i = systems.length - 1; i >= 0; i--) {
				this._systems[systems[i]].setup();
			};
            console.log('Start Game!');
			this.game.changeState('game');
		},
		addSystem: function(type, klass){
			console.log(type, klass)
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
			return entity;
		},
		removeEntity: function(){

		},
		render: function(delta){
			var systems = this._systemNames;
			for (var i = systems.length - 1; i >= 0; i--) {
				this._systems[systems[i]].render(delta);
			};
			this._super(delta);
		},
		tick: function(delta){
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