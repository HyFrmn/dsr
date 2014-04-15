define([
        'sge',
        './core'
    ], function(sge, core){
        //http://james.padolsey.com/javascript/wordwrap-for-javascript/
        function wordwrap( str, width, brk, cut ) {
         
            brk = brk || '\n';
            width = width || 75;
            cut = cut || false;
         
            if (!str) { return str; }
         
            var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
         
            return str.match( RegExp(regex, 'g') ).join( brk );
         
        }

        var DisplayNarrative = sge.Class.extend({
            init: function(txt){
                this._complete = false;
                this._index = 0;
                this._pages = txt.split('\n\n\n').filter(function(t){return t});
                this.text = new PIXI.BitmapText(wordwrap(this._pages[0],60), {font: '18px tahoma', align: 'left'});
                this.text.position.x = 32;
                this.text.position.y = 32;

                this.instruct = new PIXI.BitmapText('[Press Space to Continue]', {font: '18px tahoma', align: 'right'});
                this.instruct.position.x = 600 - this.instruct.textWidth - 32;
                this.instruct.position.y = 268;

                this.bg = new PIXI.Graphics();

                this.bg.beginFill(0x050B2B);
                this.bg.drawRect(0,0, 600, 300);
                this.container = new PIXI.DisplayObjectContainer();
                this.container.addChild(this.bg);
                this.container.addChild(this.text);
                this.container.addChild(this.instruct)

                this.container.position.x = 165;
                this.container.position.y = 120;
            },
            start: function(state){
                this.state = state
                this.state.container.addChild(this.container);
            },
            end: function(){
                this.state.container.removeChild(this.container);
                this._complete = true;
            },
            tick: function(delta){
                if (this.state.input.isPressed('space')){
                    this._index++;
                    if (this._index>=this._pages.length){
                        this.end();
                    } else {
                        this.text.setText(wordwrap(this._pages[this._index],60));
                    }
                }
            }
        })


        var CutsceneState = core.DSRState.extend({
            init: function(game, options){
                this._super(game, options);
                this._nodes = [];
                this._unpausing = false;
                this.container = new PIXI.DisplayObjectContainer();
            },
            startState: function(data){
                this._progress = 0;
                this._unpausing = false;
                this.gameState = this.game.getState('game');
                this.stage = this.gameState.stage;
                this.stage.addChild(this.container);

                console.log('Start Cutscene with Data:', data);
                if (data.narrative){
                    narrative = new DisplayNarrative(data.narrative);
                    this._nodes.push(narrative);
                }
            },
            endState: function(){
                this.gameState = null;
                this.stage.removeChild(this.container);
                this.stage = null;
            },
            tick: function(delta){
                if (this._current==null || this._current._complete){
                    this._current=this._nodes.shift();
                    if (this._current==null){
                        this.game.changeState('game');
                    } else {
                        this._current.start(this);
                    }
                }
                if (this._current){
                    this._current.tick(delta);
                }
                /*
                if (this.input.isDown('space')){
                    if (!this._unpausing){
                        this._unpausing = true;
                        this.game.changeState('game');
                    }
                }
                */
            },
            render: function(delta){
           
                //Actually Render The Screen
                this._super(delta);
                
            }
        })

        return {CutsceneState: CutsceneState}
    }
)