define([
        'sge',
        './entity'
    ], function(sge, Entity){
        var DSRState = sge.GameState.extend({
            STAGE_COLOR: 0x050B2B,
            init: function(game, options){
                this._super(game, options);
                this.stage = new PIXI.Stage(this.STAGE_COLOR);
            },
            render: function(){
                this.game.renderer.render(this.stage);
            }
        })

        var DSRSystem = sge.Class.extend({
            init: function(state){
                this.state = state;
            },
            load: function(manifest){
                return null;
            },
            setup: function(systems){
            
            },
            tick: function(){},
            render: function(){},
        })

        var loadAssets = function(loader, manifest){
            console.log('Loading!!', loader, manifest)
            var promises = [];
            if (manifest.tiles){
                manifest.tiles.forEach(function(url){
                    promises.push(loader.loadSpriteFrames(url, url.match(/\/(\w*)\.\w*$/)[1], 32, 32))
                })
            }
            if (manifest.sprites){
                manifest.sprites.forEach(function(data){
                    promises.push(loader.loadSpriteFrames(data[0], data[0].match(/\/(\w*)\.\w*$/)[1], data[1], data[2]))
                })
            }
            if (manifest.entities){
                manifest.entities.forEach(function(url){
                    promises.push(loader.loadJSON(url).then(Entity.load));
                });
            }
            return sge.When.all(promises);
        }

        return {
            DSRState : DSRState,
            DSRSystem : DSRSystem,
            loadAssets : loadAssets
        }
    }
)