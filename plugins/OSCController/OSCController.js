define(['require'], function(require) {

    /* This gets returned to the host as soon as the plugin is loaded */ 
    var pluginConf = {
        osc: true,
        audioIn: 4,
        audioOut: 1,
        canvas: {
            width: 520,
            height: 520
        },
    };
  
    /* This gets called when all the resources are loaded */
    var pluginFunction = function (args, resources) {
		
        // The canvas part
        this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
		
		var knobImage = resources[0];
		var knobLeft = 10;
		var knobSpacing = 84;
        var knobArgs = {
             imagesArray : [knobImage],
             tileWidth: 64,
             tileHeight: 64,
             imageNum: 64,
             bottomAngularOffset: 33,
             ID: "",
             left: 0,
             top: 0,
             onValueSet: function(slot, value) {
                 this.ui.refresh();
             }.bind(this),
             isListening : true
         };
		 for (var i = 0; i < 4; i +=1) {
             knobArgs.ID = 'knob' + i;
             knobArgs.left = (knobLeft + i * knobSpacing);
             this.ui.addElement(new K2.Knob(knobArgs));
		 }
		 this.ui.refresh();
	 }
  
    /* This function gets called by the host every time an instance of
       the plugin is requested [e.g: displayed on screen] */        
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  'image!'+ require.toUrl('./LittlePhatty.png'),
                    /*'image!'+ require.toUrl('./'),
                    'image!'+ require.toUrl('./'),
                    'image!'+ require.toUrl('./'),
                    'image!'+ require.toUrl('./')
					*/],
                    function () {
                        var resources = arguments;
                        pluginFunction.call (this, args, resources);
                    }.bind(this),
                    function (err) {
                        console.error ("Error loading resources");
                        var failedId = err.requireModules && err.requireModules[0]
                        requirejs.undef(failedId);
                        args.K2HInterface.pluginError (args.id, "Error loading resources");
                    });
    };
      
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});