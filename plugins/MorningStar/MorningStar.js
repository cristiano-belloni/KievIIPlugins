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
        var blackKnobImage = resources[1];
        var whiteKnobImage = resources[2];
        var deckImage = resources[3];
        var keyBlackImage = resources[4];
        var keyWhiteImage = resources[5];
        var keyBlackDownImage = resources[6];
        var keyWhiteDownImage = resources[7];
        
        this.name = args.name;
        this.id = args.id;
        
        // The sound part
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        var context = this.context;
        
        // The graphical part
        this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas}, {'breakOnFirstEvent': true});
        
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
        
        var keyCallback = function (slot, value, element) {
            this.ui.refresh();
        }.bind(this);
        
        // White keys
        var whiteKeyArgs = {
            ID: "",
            left: 0,
            top: 0,
            mode: 'immediate',
            imagesArray : [keyWhiteImage, keyWhiteDownImage],
            onValueSet: keyCallback
        };
        
        for (var i = 0; i < 21; i+=1) {
            whiteKeyArgs.top = 300;
            whiteKeyArgs.left = 14 + i * 30;    
            whiteKeyArgs.ID = "wk_" + i;
            this.ui.addElement(new K2.Button(whiteKeyArgs), {zIndex: 1});
        }
        
        // Black keys
        var blackKeyArgs = {
                ID: "",
                left: 0,
                top: 0,
                mode: 'immediate',
                imagesArray : [keyBlackImage, keyBlackDownImage],
                onValueSet: keyCallback
            };
            
            var bkArray = [34, 64, 124, 154, 184, 244, 274, 334, 364, 394, 454, 484, 544, 574, 604];
        
            for (var i = 0; i < bkArray.length; i+=1) {
                blackKeyArgs.top = 299;
                blackKeyArgs.left = bkArray[i];    
                blackKeyArgs.ID = "bk_" + i;
                this.ui.addElement(new K2.Button(blackKeyArgs), {zIndex: 10});
            }
            
        this.knobDescription = [ {id: 'envelope', init: 0, type: 'white'},
                                 {id: 'release', init: 0, type: 'white'},
                                 {id: 'cutoff', init: 0, type: 'white'},
                                 {id: 'resonance', init: 0, type: 'white'},
                                 {id: 'reverb', init: 0, type: 'black'},
                                 {id: 'distortion', init: 0, type: 'black'},
                                 {id: 'volume', init: 0, type: 'black'},
                              ];
        /* KNOB INIT */
       var knobArgs = {
            ID: '',
            left: 0 ,
            top: 0,
            image : null,
            sensitivity : 5000,
            initAngValue: 270,
            startAngValue: 218,
            stopAngValue: 501,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
        
        var whiteInit = 44;
        var whiteSpacing = 165;
        var blackInit = 346;
        var blackSpacing = 101;
        var whiteTop = 34;
        var blackTop = 180;
        
        for (var i = 0; i < this.knobDescription.length; i+=1) {
            var currKnob = this.knobDescription[i];
            
            knobArgs.ID = currKnob.id;
            
            if (currKnob.type === 'white') {
                knobArgs.image = whiteKnobImage;
                knobArgs.top = whiteTop;
                knobArgs.left = (whiteInit + i * whiteSpacing);
             }
            else if (currKnob.type === 'black') {
                knobArgs.image = blackKnobImage;
                knobArgs.top = blackTop;
                knobArgs.left = (blackInit + (i - 4) * blackSpacing);
            }
             
            this.ui.addElement(new K2.RotKnob(knobArgs));
            var initValue = currKnob.init;
            this.ui.setValue ({elementID: knobArgs.ID, value: initValue});
        }    
            
        this.ui.refresh();
        
  	};
  
  
    /* This function gets called by the host every time an instance of
       the plugin is requested [e.g: displayed on screen] */        
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  
					require.toUrl('assets/js/synth.js'),
					'image!'+ require.toUrl('./assets/images/bknob.png'),
					'image!'+ require.toUrl('./assets/images/wknob.png'),
                    'image!'+ require.toUrl('./assets/images/msdeck.png'),
                    'image!'+ require.toUrl('./assets/images/keyblack.png'),
                    'image!'+ require.toUrl('./assets/images/keywhite.png'),
                    'image!'+ require.toUrl('./assets/images/keyblack_down.png'),
                    'image!'+ require.toUrl('./assets/images/keywhite_down.png')],
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