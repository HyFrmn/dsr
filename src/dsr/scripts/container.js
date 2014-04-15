var update = function(){
	if (!entity.container.open){
		entity.container.open = true;
		entity.sprite.frame = entity.container.openFrame;
	} else {
		entity.container.open = false;
		entity.sprite.frame = entity.container.closeFrame;
	}
}

entity.on('interact', function(user){
	state.getSystem('inventory').trade(user, entity);
	update();
});