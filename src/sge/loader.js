define([
        './class',
        './when'
    ], function(Class, when){
        var ajax = function(url, callback, failure){
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('get', url, true);
            xmlHttp.send(null);
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        callback(xmlHttp.responseText, xmlHttp);
                    } else {
                        failure(xmlHttp);
                    }
                } else {
                  //still loading
                }
            }
        }



        var Loader = Class.extend({
            init: function(noAudio){
                
            },
            loadJSON: function(url){
                var defered = new when.defer();
                ajax(url, function(text){
                    try {
                        var data = JSON.parse(text);
                    } catch(err) {
                        console.log('Error Parsing:', url)
                        console.error(err);
                    }
                    
                    defered.resolve(data);
                }, function(xmlHttp){
                    defered.reject(xmlHttp);
                });
                return defered.promise;
            },
            loadJS: function(url, that, locals) {
                var defered = new when.defer();
                ajax(url, function(text){
                    var sandbox = this.createSandbox(text, that, locals);
                    defered.resolve(sandbox);
                }.bind(this), function(xmlHttp){
                    defered.reject(xmlHttp);
                });
                return defered.promise;
            },
            loadFont: function(url){
                var defered = new when.defer();
                var loader = new PIXI.AssetLoader([url]);
                loader.onComplete = function(){
                    defered.resolve();
                }
                loader.load();
                return defered.promise;
            },
            loadTexture: function(url, textureName){
                var defered = new when.defer();
                var tex = new PIXI.ImageLoader(url);
                tex.addEventListener("loaded", function(event){
                    PIXI.TextureCache[textureName] = new PIXI.Texture(tex.texture.baseTexture);
                    defered.resolve(tex);
                });
                tex.load();
                return defered.promise;
            },
            loadSpriteFrames: function(url, textureName, width, height){
                var defered = new when.defer();
                var tex = new PIXI.ImageLoader(url);
                tex.addEventListener("loaded", function(event){
                    var xcount = Math.floor(tex.texture.width/width);
                    var ycount = Math.floor(tex.texture.height/height);
                    var frame = 0;
                    var texture;
                    for (var y=0;y<ycount;y++){
                        for(var x=0;x<xcount;x++){
                            texture = new PIXI.Texture(tex.texture, {x: x*width, y: y*height, width: width, height: height});
                            PIXI.TextureCache[textureName+'-'+frame] = texture;
                            frame++;
                            
                        }
                    }
                    defered.resolve(tex);
                });
                tex.load();
                return defered.promise;
            },
            createSandbox: function(code, that, locals) {
                that = that || Object.create(null);
                locals = locals || {};
                var params = []; // the names of local variables
                var args = []; // the local variables

                for (var param in locals) {
                    if (locals.hasOwnProperty(param)) {
                        args.push(locals[param]);
                        params.push(param);
                    }
                }

                var context = Array.prototype.concat.call(that, params, code); // create the parameter list for the sandbox
                var sandbox = new (Function.prototype.bind.apply(Function, context)); // create the sandbox function
                context = Array.prototype.concat.call(that, args); // create the argument list for the sandbox

                return Function.prototype.bind.apply(sandbox, context); // bind the local variables to the sandbox
            },

        })

        return Loader
    }
)