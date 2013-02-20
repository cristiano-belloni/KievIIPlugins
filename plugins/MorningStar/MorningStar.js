define(['require'], function(require) {
    
    /* This gets returned to the host as soon as the plugin is loaded */ 
    var pluginConf = {
        osc: true,
        audioIn: 1,
        audioOut: 1,
        canvas: {
            width: 657,
            height: 450
        },
    }
  
    /* This gets called when all the resources are loaded */
    var pluginFunction = function (args, resources) {
        var synth = resources[0];
        var blacKnobImage = resources[1];
        var whiteKnobImage = resources[2];
        var deckImage = resources[3];
        
        this.name = args.name;
        this.id = args.id;
        
        // The sound part
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        var context = this.context;
        
        // The graphical part
        this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
        
        /* BACKGROUND INIT */
        
        var bgArgs = new K2.Background({
            ID: 'background',
            image: deckImage,
            top: 0,
            left: 0
        });
    
        this.ui.addElement(bgArgs, {zIndex: 0});
        
        this.viewWidth = args.canvas.width;
        this.viewHeight = args.canvas.height;
        
  	};
  
  
    /* This function gets called by the host every time an instance of
       the plugin is requested [e.g: displayed on screen] */        
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  
					'image!'+ require.toUrl('./assets/js/synth.js'),
					'image!'+ require.toUrl('./assets/images/bknob.png'),
					'image!'+ require.toUrl('./assets/images/wknob.png'),
                    'image!'+ require.toUrl('./assets/images/msdeck.png')],
                    function () {
                        var resources = arguments;
                        pluginFunction.call (this, args, resources);
                    }.bind(this),
                    function (err) {
                        console.error ("Error loading resources");
                        args.K2HInterface.pluginError (args.id, "Error loading resources");
                    }
                );
    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});