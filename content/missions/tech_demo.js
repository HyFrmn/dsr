console.log(state);
var hud = state.getSystem('hud');
var E = state.getEntityByName.bind(state);
//Display Objective.
instruction = "Use (arrow keys) to move.";
hud.instructions = instruction;
E('door.entry').on('highlight.on', function(){
	instruction = "Use (spacebar) to open the door.";
	hud.instructions = instruction;
	//Find Entry door
	var entryDoor = state.getEntityByName('door.entry');
	entryDoor.on('interact', function(){
		hud.instructions = "Go into the next room.";

		var basicDoor = state.getEntityByName('door.basic');
		console.log(basicDoor)
		basicDoor.on('interact', function(){
			console.log('Basic Door')
			hud.instructions = "Use the switch to turn on the lights."
		
			var lightSwitch = state.getEntityByName('switch.lgt_room_basic');
			lightSwitch.on('interact', function(){
				state.getEntityByName('door.locked').light.enabled = true;
				hud.instructions = "Try the next room.";
				
				var lockedDoor = state.getEntityByName('door.locked');
				lockedDoor.on('interact', function(){
					E('lgt_mainroom_e').light.enabled = true;
					E('lgt_mainroom_w').light.enabled = true;
					hud.instructions = "Search for a key."
				})

			}, {once: true});

		}, {once: true});

	}, {once: true});
}, {once: true});
/*
setTimeout(function(){
	console.log('Cutscene');
	
	state.startCutscene({
		narrative: "Welcome to Deep Space Rescue Training. I'm your trainer Spike, and I'm here to help get you situated in your rig.\n\n\n" +
			"First let's get familar with the basic controls. You can use the arrow keys to move around, and the spacebar to interact with highlighted objects.\n\n\n"
	});
}, 1000);
//*/

