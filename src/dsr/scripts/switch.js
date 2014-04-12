var lightSystem = state.getSystem('light');

var update = function(){
	if (entity.switch.toggle){
		entity.sprite.frame = 1;
		entity.light.tint = 0x66FF66;
	} else {
		entity.sprite.frame = 0;
		entity.light.tint = 0xFF6666;
	}
}

entity.on('interact', function(user){
	console.log('Update Switch')
	entity.switch.toggle = !entity.switch.toggle;
	update();
});
update();