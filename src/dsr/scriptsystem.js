define(['sge','./core'], function(sge, core, Entity){
	var ScriptSystem = core.DSRSystem.extend({
		init: function(state){
			this.state = state;
		},
		setup: function(map){
			var entities = this.state.getEntities();
			for (var i = entities.length - 1; i >= 0; i--) {
				var entity = entities[i];
				if (entity.script!==undefined){
					var src = entity.script.src;
					var func = this.createSandbox(
									ScriptSystem._code[src],
									null,
									{
										entity: entity,
										state: this.state
									});
					func();
				}
			};
		},
		tick: function(delta, entities){
			
		},
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
        },
	});
	ScriptSystem._code = {};
	ScriptSystem.Load = function(loader, manifest, promises){
		if (manifest.scripts){
			for (var i = manifest.scripts.length - 1; i >= 0; i--) {
				var script = manifest.scripts[i];
				var url = '/src/dsr/scripts/' + script + '.js';
				var p = loader.loadCode(url).then(function(code){
					ScriptSystem._code[this.script] = code;
				}.bind({script: script}));
				promises.push(p);
			};
		}
	}
	core.addLoadCallback(ScriptSystem.Load);
	return ScriptSystem;
})