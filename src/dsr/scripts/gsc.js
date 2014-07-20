var constraint = null;

console.log('WRAP:', entity);
entity.on('interact.action:start', function(e){
	entity.highlight.color = 0xFF0000;
	console.log('GRAB!!');
	
});

entity.on('interact.action:end', function(e){
	entity.highlight.color = 0x0068E6;
})