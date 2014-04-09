define([
		'./class'
	], 
	function(Class){

		var GameState =  Class.extend({
			init: function(game, options){
				this.game = game;
				this._time = 0;
				this.input = game.input.createProxy();
			},
			startState: function(){},
			endState: function(){},
			tick: function(delta){
			    this._time += delta;
			},
		    getTime: function(){
		        return this._time;
		    }
		});



		return GameState;
	}
)