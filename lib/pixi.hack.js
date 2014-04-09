/**
 * Loads the XML font data
 *
 * @method load
 */
PIXI.BitmapFontLoader.prototype.load = function()
{
    this.ajaxRequest = new PIXI.AjaxRequest();
    var scope = this;
    this.ajaxRequest.onreadystatechange = function () {
            scope.onJSONLoaded();
    };


    this.ajaxRequest.open("GET", this.url, true);
    if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
    this.ajaxRequest.send(null);
};


/**
 * Invoked when XML file is loaded, parses the data
 *
 * Modified method to use json instead for CocoonJS
 * with json conversion seen here:
 * http://www.freeformatter.com/xml-to-json-converter.htm
 *
 * @method onXMLLoaded
 * @private
 */
PIXI.BitmapFontLoader.prototype.onJSONLoaded = function()
{
    if (this.ajaxRequest.readyState == 4) {
        if (this.ajaxRequest.status == 200 || window.location.href.indexOf("http") == -1) {
            
            this.json = JSON.parse(this.ajaxRequest.responseText);
            
            var textureUrl = "content/font/" + this.json.pages[0]['@file'];
            var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
            this.texture = image.texture.baseTexture;
            
            var data = {};
            data.font = this.json.info[ '@face' ];
            data.size = parseInt( this.json.info[ '@size' ], 10 );
            data.lineHeight = parseInt( this.json.common[ '@lineHeight' ], 10 );
            data.chars = {};


            var letters = this.json.chars.char;


            for (var i = 0; i < letters.length; i++)
            {
                var charCode = parseInt(letters[i]["@id"], 10);
                var textureRect = {
                    x: parseInt(letters[i]["@x"], 10),
                    y: parseInt(letters[i]["@y"], 10),
                    width: parseInt(letters[i]["@width"], 10),
                    height: parseInt(letters[i]["@height"], 10)
                };
                PIXI.TextureCache[charCode] = new PIXI.Texture(this.texture, textureRect);
                
                data.chars[charCode] = {
                    xOffset: parseInt(letters[i]["@xoffset"], 10), 
                    yOffset: parseInt(letters[i]["@yoffset"], 10), 
                    xAdvance: parseInt(letters[i]["@xadvance"], 10), 
                    kerning: {},
                    texture:new PIXI.Texture(this.texture, textureRect)
                };                
                
            }
            
            if ( this.json.kernings && this.json.kernings.kerning ) {
                var kernings = this.json.kernings.kerning;
                for (i = 0; i < kernings.length; i++)
                {
                   var first = parseInt(kernings[i]["@first"], 10);
                   var second = parseInt(kernings[i]["@second"], 10);
                   var amount = parseInt(kernings[i]["@amount"], 10);


                   data.chars[second].kerning[first] = amount;
                }                            
            }
            
            
            PIXI.BitmapText.fonts[data.font] = data;


            var scope = this;
            image.addEventListener("loaded", function() {
                scope.onLoaded();
            });
            image.load();                 
        }
        else
        {
            this.onError();
        }
    }    
    
};


/**
 * Invoked when all files are loaded (xml/fnt and texture)
 *
 * @method onLoaded
 * @private
 */
PIXI.BitmapFontLoader.prototype.onLoaded = function()
{
    this.dispatchEvent({type: "loaded", content: this});
};

/*
PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2)
{
        if(child === child2) {
                return;
        }

        var index1 = this.children.indexOf(child);
        var index2 = this.children.indexOf(child2);
        
        if(index1 < 0 || index2 < 0) {
                throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
        }

        this.removeChild(child);
        this.removeChild(child2);
        
        if(index1 < index2)
        {
                this.addChildAt(child2, index1);
                this.addChildAt(child, index2);
        }
        else
        {
                this.addChildAt(child, index2);
                this.addChildAt(child2, index1);
        }
}
*/