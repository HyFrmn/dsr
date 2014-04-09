define([
        'sge',
        './core'
    ], function(sge, core){
        var LoadState = core.DSRState.extend({
            init: function(game, options){
                this._super(game, options);

                this._loadBarWidth = 720;
                this._loadBarHeight = 32;
                this._dots = 0;
                this._dotsTimer = 1/3;

                this.loadBar = new PIXI.Graphics();
                this.loadBar.position.y = game.height/2 - (this._loadBarHeight/2);
                this.loadBar.position.x = game.width/2 - (this._loadBarWidth/2);
                this.stage.addChild(this.loadBar);

                this.text = new PIXI.BitmapText('LOADING', {font: '32px 8bit', align: 'center'});
                this.text.position.x = game.renderer.width / 2 - (this._loadBarWidth/2) + 4;
                this.text.position.y = game.renderer.height / 2  - (this._loadBarHeight/2);
                this.stage.addChild(this.text);

            },
            startState: function(){
                this._progress = 0;
            },
            tick: function(delta){
                this._dotsTimer -= delta;
                if (this._dotsTimer<0){
                    this._dots++;
                    this._dotsTimer=1/3;
                    if (this._dots>3){
                        this._dots=0;
                    }
                    this.text.setText('LOADING' + Array(this._dots+1).join('.'));
                }
            },
            render: function(delta){
                this.loadBar.clear();
                this.loadBar.beginFill(0x0068E6);
                this.loadBar.drawRect(0,0,this._loadBarWidth,this._loadBarHeight);
                this.loadBar.endFill();

                //Actually Render The Screen
                this._super(delta);
                
            }
        })

        return {LoadState: LoadState}
    }
)