define(['sge','./core'], function(sge, core){

    COMP_DEFAULT = {
        'xform' : {
            'tx' : 0,
            'ty' : 0
        },
        'sprite' : {
            'offsetx' : 0,
            'offsety' : 0,
            'scalex'  : 1,
            'scaley'  : 1,
            'frame'   : 0,
            'src'  : null,
            'visible' : true
        },
        'physics' : {
            'vx' : 0,
            'vy' : 0,
            'width' : 12,
            'height' : 12
        },
        'movement' : {
            'vx' : 0,
            'vy' : 0,
            'speed' : 128
        },
        'highlight' : {
            'visible' : false,
            'color' : 0x0068E6
        },
        'door' : {
            open: false
        },
        'touch' : {
            scripts : []
        },
        'script' : {
            'src' : null
        },
        'light' : {
            type: 'point_small',
            tint: 0xFFFFFF,
            offsetx: 0,
            offsety: 0
        },
        'interact' : {
            enabled : true,
            targets : [[0,0]],
        },
        'highlight' : {
            radius : 32,
            visible : false
        },
        'inventory' : {
            items: {},
            resources: {},
        }
    }

    var deepExtend = function(destination, source) {
          for (var property in source) {
            if (source[property] && source[property].constructor &&
             source[property].constructor === Object) {
              destination[property] = destination[property] || {};
              arguments.callee(destination[property], source[property]);
            } else {
              destination[property] = source[property];
            }
          }
          return destination;
        };

    function merge_options(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    var Entity = sge.Observable.extend({
        init: function(base, comp_data){
            this._super();
            this.id = null;
            this._components = {};

            var comps = {};
            
            if (base!=undefined){
                base_data = Entity._data[base];
                if (base_data.inherit){

                    var inherit_stack=[base_data];
                    var inherit_data = Entity._data[base_data.inherit];
                    while (inherit_data){
                        inherit_stack.push(inherit_data);  
                        if (inherit_data.inherit){
                            inherit_data = Entity._data[inherit_data.inherit_data]
                        } else {
                            break;
                        }
                    }

                    while (inherit_stack.length>0){
                        comps = deepExtend(comps, inherit_stack.pop());

                    }
                    console.log(comps, comp_data)
                    comps = deepExtend(comps, comp_data);
                    console.log('Resolved:', comps)
                } else {
                    comps = deepExtend(deepExtend({}, base_data), comp_data);
                }
                //console.log(base, comp_data)
                if (comps!=undefined){
                    var keys = Object.keys(comps);
                    keys.forEach(function(key){
                        if (key=="inherit"){
                            return
                        }
                        this.addComponent(key, comps[key]);
                    }.bind(this))
                }
            }
        },
        addComponent: function(type, data){
            var compData = COMP_DEFAULT[type];
            if (compData===undefined){
                compData = {};
            }
            this[type] = merge_options(compData, data);
        }
    });
    
    Entity._data = {}
    Entity._bases = {}
    Entity.load = function(data){
        var keys = Object.keys(data.data);
        keys.forEach(function(key){
            Entity._data[key] = data.data[key];
        });

        keys = Object.keys(data.bases);
        keys.forEach(function(base){
            Entity._bases[base] = data.bases[base];
        });
    }
    return Entity;
})