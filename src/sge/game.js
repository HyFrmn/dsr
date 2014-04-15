define([
		'./class',
		'./input'
	], 
	function(Class, Input){
		// @if DEBUG
		var stats = new Stats();
		stats.setMode(0);

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		document.body.appendChild( stats.domElement );

		// @endif

		var Game =  Class.extend({
			init: function(options){
				this.options = options || {
					width:  720,
					height: 405,
					fps:    60
				};
				var canvas = document.createElement('canvas'); 
				canvas.style.cssText="idtkscale:ScaleAspectFill;";
                canvas.width= this.options.width;
                canvas.height= this.options.height;
                document.body.appendChild(canvas);
            	this.width = canvas.width;
            	this.height = canvas.height;
	
				            

				this.renderer = null;

				this._nextState = null;
				this._states = {};
				this._stateClassMap = {};
				this._currentState = null;
				this.current = null;
				//Don't Support Canvas
				this.renderer = new PIXI.WebGLRenderer(this.width, this.height, canvas);
				this.input = new Input(canvas);
			},
			
			start: function(data){
				this.data = data || {};
				document.body.appendChild(this.renderer.view);
				this.run();
				requestAnimFrame(this.render.bind(this))
			},

			run: function(fps) {
				if (fps==undefined){
					fps = 30.0;
				};
				this._lastTick = Date.now();
				this._interval = setInterval(this.tickCallback.bind(this), 1000.0 / this.options.fps);
			},

			stop: function(){
				clearInterval(this._interval);
				this._interval = null;
			},

			tickCallback: function(){
				var now = Date.now();
				var delta = now - this._lastTick;
				this._lastTick = now;
				this.input.tick(delta);
				this.tick(delta/1000);
			},

			tick: function(delta){
				
				if (this._currentState){
					this._currentState.tick(delta);
				}
				if (this._nextState!=null){
					this._changeState(this._nextState);
					this._nextState=null;
				}
				
			},

			render: function(){
				// @if DEBUG
				stats.begin();
				// @endif
				requestAnimFrame(this.render.bind(this));
				if (this._currentState){
					this._currentState.render();
				}
				// @if DEBUG
				stats.end();
				// @endif
			},


			setStateClass: function(name, klass){
				
				this._stateClassMap[name] = klass;
			},
			getState: function(name){
				return this._states[name];
			},

			createState: function(name){
				if (this._stateClassMap[name]===undefined){
					console.error('No state defined for ' + name);
				}
				var state = new this._stateClassMap[name](this);
				this._states[name] = state;
				return state;
			},

			changeState: function(name, data){
				this._nextState = [name, data];
			},

			_changeState: function(name){
				if (this._currentState){
					this._currentState.endState();
				}
				this.current = name[0];
				this._currentState = this.getState(name[0]);
				this._currentState.startState(name[1]);
			},


			resizeCallback: function(){},
			loseFocusCallback: function(){},
			endFocusCallback: function(){}

			
		});

		return Game;
	}
)