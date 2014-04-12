define([
        'sge',
        './core'
    ], function(sge, core){
        var PauseState = core.DSRState.extend({
            init: function(game, options){
                 console.log('test')
                this._super(game, options);
                this._dots = 0;
                this._dotsTimer = 1/3;
                this._unpausing = false;
                this.text = new PIXI.BitmapText('Paused', {font: '32px 8bit', align: 'center'});
                this.text.position.x = game.renderer.width / 2;
                this.text.position.y = game.renderer.height / 2;
                this.stage.addChild(this.text);


            },
            startState: function(){
                this._progress = 0;
                this._unpausing = false;
            },
            tick: function(delta){
                this._dotsTimer -= delta;
                if (this._dotsTimer<0){
                    this._dots++;
                    this._dotsTimer=1/3;
                    if (this._dots>3){
                        this._dots=0;
                    }
                    this.text.setText('Paused' + Array(this._dots+1).join('.'));
                }
                if (this.input.isDown('space')){
                    if (!this._unpausing){
                        this._unpausing = true;
                        this.game.changeState('game');
                    }
                }
            },
            render: function(delta){
           
                //Actually Render The Screen
                this._super(delta);
                
            }
        })

        return {PauseState: PauseState}
    }
)