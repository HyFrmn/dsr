define([
		'./class',
		'./observable',
		'./game',
		'./gamestate',
		'./loader',
		'./when'
	], function(Class, Observable, Game, GameState, Loader, When){
		return {
			Class : Class,
			Observable : Observable,
			Game : Game,
			GameState : GameState,
			Loader : Loader,
			When : When,
			createSandbox: function(code, that, locals) {
                that = that || Object.create(null);
                locals = locals || {};
                var params = []; // the names of local variables
                var args = []; // the local variables

                for (var param in locals) {
                    if (locals.hasOwnProperty(param)) {
                        args.push(locals[param]);
                        params.push(param);
                    }
                }

                var context = Array.prototype.concat.call(that, params, code); // create the parameter list for the sandbox
                var sandbox = new (Function.prototype.bind.apply(Function, context)); // create the sandbox function
                context = Array.prototype.concat.call(that, args); // create the argument list for the sandbox

                return Function.prototype.bind.apply(sandbox, context); // bind the local variables to the sandbox
            }
		}
	}
)