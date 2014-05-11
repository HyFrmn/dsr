require.config({
	baseUrl: 'src',
	packages: ['sge', 'dsr'],

})
define([
		'sge','dsr'
	], function(sge, dsr){
		function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
        }

		var options = {
            width: 960,
            height: 540,
            map: getURLParameter('map') || 'tech_demo'
        }

		dsr.createGame(options);
	}
)