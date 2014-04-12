define([
        'sge',
        './core',
        './loadstate',
        './playstate',
        './pausestate'
    ], 
    function(
            sge,
            core,
            loadstate,
            playstate,
            pausestate
        ){
        var createGame = function(options){
            var loader = new sge.Loader();
            var promises = [];
            promises.push(loader.loadFont('content/font/standard_white.fnt'));
            sge.When.all(promises).then(function(){
                game = new sge.Game(options);
                window.onresize = function(size){document.getElementsByTagName('canvas')[0].style.width = window.innerWidth  + "px"};
                document.getElementsByTagName('canvas')[0].style.width = window.innerWidth  + "px"; 
                game.loader = loader;
                loader.loadJSON('content/manifest.json').then(function(manifest){
                    core.loadAssets(loader, manifest).then(function(){
                        console.log('Loaded Assets')
                        game.setStateClass('load', loadstate.LoadState);
                        game.changeState('load');
                        game.createState('load');
                        console.log(pausestate)
                        game.setStateClass('pause', pausestate.PauseState);
                        game.createState('pause');
                        game.setStateClass('game', playstate.PlayState);
                        game.createState('game');
                        game.start();
                    })
                });
                game.onblur = function(){
                    if (game.current=='game'){
                        game.changeState('pause');
                    }
                }
                window.onblur = game.onblur;
            })
        }

        return {
            createGame : createGame
        }
    }
)