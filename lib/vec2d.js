/*
       Common vector2 operations
       Ugly as hell but no GC headaches
       Author: Tudor Nita | cgrats.com
       Version: 0.6 

*/

/* vector math */
var Vec2 = new function() {
    /* vector * scalar */
    this.mulS = function(v, value)  { v.x*=value;  v.y*=value;      }
    /* vector * vector */
    this.mulV = function(v1,v2)     { v1.x*= v2.x;v1.y*=v2.y;       }
    /* vector / scalar */
    this.divS = function(v, value)  { v.x/=value; v.y/=value;       }
    /* vector + scalar */
    this.addS = function(v, value)  { v.x+=value; v.y+=value;       }
    /* vector + vector */
    this.addV  = function(v1,v2)    { v1.x+=v2.x; v1.y+=v2.y;       }
    /* vector - scalar */
    this.subS = function(v, value)  { v.x-=value;  v.y-=value;      }
    /* vector - vector */
    this.subV = function(v1, v2)    { v1.x-=v2.x; v1.y-=v2.y;       }
    /*  vector absolute */
    this.abs = function(v)          { Math.abs(v.x); Math.abs(v.y); }
    /* dot product */
    this.dot = function(v1,v2)      { return (v1.x*v2.x+v2.y*v2.y); }
    /* vector length */
    this.length = function(v)       { return Math.sqrt(Vec2.dot(v,v));       }
    /* distance between vectors */
    this.dist = function(v1,v2)     { return (v2.subV(v1)).length();    }
    /* vector length, squared */
    this.lengthSqr = function(v)    { return Vec2.dot(v,v);                  }
    /* 
        vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    this.lerp = function(targetV2, v1,v2, value) {  
        targetV2.x = v1.x+(v2.x-v1.x)*value;
        targetV2.y = v1.y+(v2.y-v1.y)*value;
    }
    /* normalize a vector */
    this.normalize  = function(v) {
        var vlen   = Vec2.length(v);
        v.x = v.x/ vlen;
        v.y = v.y/ vlen;
    }

    this.copy = function(target, src) {
        target.x = src.x;
        target.y = src.y;
    }

    this.clone = function(target){
        return {x: target.x, y: target.y};
    }
}()