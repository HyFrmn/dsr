define([
    './class'
    ],
    function(Class){
        /**
         * Base class for all observable objects utilizing event system.
         *
         */
        var Observable = Class.extend({
            init: function(){
                this._lisenters = {};
            },
            /**
             * Register a `callback` with this observable, for the given `eventName`. The option 'once'
             * be set to true, for the callback to be removed automatically after the event is fired the first time.
             * 
             * @param  {String}   eventName
             * @param  {Function} callback
             * @param  {Object}   options
             * @return {Function}
             * 
             */
            on: function(eventName, callback, options){
                options = options || {};
                if (this._lisenters[eventName]==undefined){
                    this._lisenters[eventName]=[];
                }
                this._lisenters[eventName].push([callback, options]);
            },

            /**
             * Removed a registered callback and returns the callback.
             * @param  {String}   eventName
             * @param  {Function} callback
             * @param  {Object}   options
             * @return {Function}
             */
            off: function(eventName, callback, options){
                if (this._lisenters[eventName]==undefined){
                    this._lisenters[eventName]=[];
                }
                this._lisenters[eventName] = this._lisenters[eventName].filter(function(data){
                    return data[0]!=callback;
                });
            },

            /**
             * Trigger the named event.
             * @param  {String} eventName
             * 
             */
            trigger: function(){
                var args = Array.prototype.slice.call(arguments);
                var eventName = args.shift();
                if (this._lisenters[eventName]==undefined){
                    return;
                }
                var callbacks = this._lisenters[eventName];
                this._lisenters[eventName] = this._lisenters[eventName].filter(function(data){
                    data[0].apply(this, args);
                    if (data[1].once){
                        return false;
                    }
                    return true;
                })
            }
        });

        return Observable;
    }
)