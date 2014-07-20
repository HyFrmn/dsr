var lightSystem = state.getSystem('light');
var electrical = state.getSystem('electrical');
var update = function(){
	if (entity.switch.toggle){
		electrical.turnOn(entity)
	} else {
		electrical.turnOff(entity)
	}
}

entity.on('interact', function(user){
	entity.switch.toggle = !entity.switch.toggle;
	update();
});
update();