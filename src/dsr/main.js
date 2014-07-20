define([
        'sge',
        './core',
        './loadstate',
        './playstate',
        './pausestate',
        './cutscenestate',
        './gameoverstate'
    ], 
    function(
            sge,
            core,
            loadstate,
            playstate,
            pausestate,
            cutscenestate,
            gameoverstate
        ){
        var createGame = function(options){
            var loader = new sge.Loader();
            var promises = [];
            promises.push(loader.loadFont('content/font/standard_white.fnt'));
            sge.When.all(promises).then(function(){
                game = new sge.Game(options);
                resizeCallback = function(size){document.getElementsByTagName('canvas')[0].style.width = Math.min(window.innerWidth-20,1280) + "px"};
                window.onresize = resizeCallback();
                resizeCallback();
                game.loader = loader;
                loader.loadJSON('content/manifest.json').then(function(manifest){
                    core.loadAssets(loader, manifest).then(function(){
                        console.log('Loaded Assets')
                        game.setStateClass('load', loadstate.LoadState);
                        game.changeState('load');
                        game.createState('load');
                        game.setStateClass('pause', pausestate.PauseState);
                        game.createState('pause');
                        game.setStateClass('gameover', gameoverstate.GameOverState);
                        game.createState('gameover');
                        game.setStateClass('cutscene', cutscenestate.CutsceneState);
                        game.createState('cutscene');
                        game.setStateClass('game', playstate.PlayState);
                        game.createState('game', options);
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