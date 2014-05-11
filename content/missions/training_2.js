console.log(state);
var hud = state.getSystem('hud');
var $ = state.getEntityByName.bind(state);

var aft_lights = state.getTagged('lgt_aft_hall');
var port_lights = state.getTagged('lgt_port_engines');
var starboard_lights = state.getTagged('lgt_starboard_engines');
var hold_lights = state.getTagged('lgt_hold');
var lights = [].concat(aft_lights, port_lights, starboard_lights, hold_lights);
lights.forEach(function(lgt){
	lgt.light.enabled = false;
})
$('switch.power').on('interact', function(){
	state.getTagged('lgt_airlock').forEach(function(lgt){
		lgt.light.enabled = true;
		lgt.light.strobe = 0;
		lgt.light.intensity = 1;
		lgt.light.tint = 0xFFFFFF;
	})
	lights.forEach(function(lgt){
		lgt.light.enabled = true;
	})
	$('switch.power').interact.enabled = false;
}, {once: true})

var esys = state.getSystem('electrical');
esys.createConnection($('switch.test'),$('door.hold'));
//esys.createConnection($('switch.test'),$('door.hallway'));