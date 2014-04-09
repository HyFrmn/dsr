define([
        'sge',
        './core',
        './loadstate',
        './playstate'
    ], 
    function(
            sge,
            core,
            loadstate,
            playstate
        ){
        var createGame = function(options){
            var loader = new sge.Loader();
            var promises = [];
            promises.push(loader.loadFont('content/font/standard_white.fnt'));
            sge.When.all(promises).then(function(){
                game = new sge.Game(options);
                game.loader = loader;
                loader.loadJSON('content/manifest.json').then(function(manifest){
                    core.loadAssets(loader, manifest).then(function(){

                        game.setStateClass('load', loadstate.LoadState);
                        game.changeState('load');
                        game.createState('load');
                        game.setStateClass('game', playstate.PlayState);
                        game.createState('game');
                        game.start();
                    })
                });
            })
        }

        return {
            createGame : createGame
        }
    }
)