var map = state.getSystem('map');
var light = state.getSystem('light');
var updateDoor = function(){
		var tile = map.getTileAtPos(entity.xform.tx, entity.xform.ty-64);
		tile.data.blocker = !entity.door.open;	
		entity.physics.active = !entity.door.open;
		entity.sprite.frame = entity.door.open ? 1 : 0;
		light._lightUpdated = false;
}
entity.on('pry.open', function(){
	entity.door.open = true;
	entity.interact.enabled = false;
	updateDoor();
})
//*
entity.on('interact', function(user){
	if (!entity.door.remote){
		if (!entity.door.locked){
			if (entity.door.stuck){
				var game = state.game;
				game.changeState('pry', [entity]);
			} else {
				entity.door.open = !entity.door.open;
				updateDoor();
			}
		}
	}
});
entity.on('electrical.on', function(){
	entity.door.open=true;
	updateDoor();
})
entity.on('electrical.off', function(){
	entity.door.open=false;
	updateDoor();
})
//*/
var tile = map.getTileAtPos(entity.xform.tx, entity.xform.ty-64);
tile.data.doorHack = true;

updateDoor();