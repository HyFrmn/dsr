var map = state.getSystem('map');
var updateDoor = function(){
		if (!entity.door.open){
			var tile = map.getTileAtPos(entity.xform.tx, entity.xform.ty);
			tile.data.passable = false;
			tile = map.getTile(tile.x, tile.y-1);
			tile.data.passable = false;
			tile = map.getTile(tile.x, tile.y-1);
			tile.data.blocker = true;
		} else {
			var tile = map.getTileAtPos(entity.xform.tx, entity.xform.ty);
			tile.data.passable = true;
			tile = map.getTile(tile.x, tile.y-1);
			tile.data.passable = true;
			tile = map.getTile(tile.x, tile.y-1);
			tile.data.blocker = false;
		}
		entity.sprite.visible = !entity.door.open;
}

entity.on('pry.open', function(){
	entity.door.open = true;
	entity.interact.enabled = false;
	updateDoor();
})

entity.on('interact', function(user){
	if (!entity.door.locked){
		if (entity.door.stuck){
			var game = state.game;
			game.changeState('pry', [entity]);
			console.log('PRz')
		} else {
			entity.door.open = !entity.door.open;
			updateDoor();
		}
	}
});

updateDoor();