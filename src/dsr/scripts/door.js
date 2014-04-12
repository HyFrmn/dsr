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
	
}

entity.on('interact', function(user){
	if (!entity.door.locked){
		entity.door.open = !entity.door.open;
		entity.sprite.visible = !entity.door.open;
		updateDoor();
	}
});

updateDoor();