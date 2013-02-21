define(['require'], function(require) {
    
    /* This gets returned to the host as soon as the plugin is loaded */ 
    var pluginConf = {
        osc: true,
        audioIn: 0,
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
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        var context = this.context;
		
		this.velocity = 1;
		
        this.MSS = new MorningStarSynth();
        this.MSS.init(context, this.audioDestination);
        
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
        
        /* LABEL INIT */
        this.label = new K2.Label({
            ID: 'statusLabel',
            width : 320,
            height : 29,
            top : 196,
            left : 42,
            transparency: 0.87,
            objParms: {
                font: "28px VT323",
                textColor: "#000",
                textBaseline: "top",
                textAlignment: "left"
            }
        });
        this.ui.addElement(this.label, {zIndex: 3});
       
        /* KEYS */
        this.viewWidth = args.canvas.width;
        this.viewHeight = args.canvas.height;
        
        var keyCallback = function (slot, value, element) {
            this.ui.refresh();
        }.bind(this);
        
        var keyCallback = function (slot, value, element) {
            
            var stIndex = 0;
            var stPower = 0;
            var whiteKeysSemitones = [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24,26,28,29,31,33,35,36];
            var blackKeysSemitones = [1,3,6,8,10,13,15,18,20,22,25,27,30,32,34];
            
            if (element.indexOf("wk_") === 0) {
                stIndex = element.split("wk_")[1];
                stPower = whiteKeysSemitones[stIndex];
            }
            
            else  if (element.indexOf("bk_") === 0) {
                stIndex = element.split("bk_")[1];
                stPower = blackKeysSemitones[stIndex];
            }
            
            else {
                return;
            }
            
            if (value === 1) {
                this.MSS.noteOn(stPower - 33, this.velocity);
            }
            else if (value === 0) {
                this.MSS.noteOff();
            }
         
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
            
        this.knobDescription = [ {id: 'envelope', init: K2.MathUtils.linearRange (0, 127, 0, 1, this.MSS.getEnvelope()), type: 'white'},
                                 {id: 'release', init: K2.MathUtils.linearRange (0, 127, 0, 1, this.MSS.getRelease()), type: 'white'},
                                 {id: 'cutoff', init: K2.MathUtils.linearRange (0, 127, 0, 1, this.MSS.getCutoff()), type: 'white'},
                                 {id: 'resonance', init: K2.MathUtils.linearRange (0, 127, 0, 1, this.MSS.getResonance()), type: 'white'},
                                 {id: 'velocity', init: this.velocity, type: 'black'},
                                 {id: 'volume', init: this.MSS.getVolume(), type: 'black'},
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
            onValueSet: function (slot, value, element) {
				switch (element) {
					case 'volume':
						this.MSS.setVolume(value);
						this.ui.setValue({elementID: "statusLabel", value: "Volume: " + Math.round(value * 127)});
					    break;
					case 'velocity':
						var velocity = K2.MathUtils.linearRange (0, 1, 0, 127, value);
						this.velocity = Math.round(velocity);
						this.ui.setValue({elementID: "statusLabel", value: "Velocity: " + this.velocity});
					    break;
					case 'envelope':
						var envelope = K2.MathUtils.linearRange (0, 1, 0, 127, value);
						this.MSS.setEnvelope(envelope);
						this.ui.setValue({elementID: "statusLabel", value: "Envelope: " + Math.round(envelope)});
					    break;
					case 'release':
						var release = K2.MathUtils.linearRange (0, 1, 0, 127, value);
						this.MSS.setRelease(release);
						this.ui.setValue({elementID: "statusLabel", value: "Release: " + Math.round(release)});
						break;
					case 'cutoff':
						var cutoff = K2.MathUtils.linearRange (0, 1, 0, 127, value);
						this.MSS.setCutoff(cutoff);
						this.ui.setValue({elementID: "statusLabel", value: "Cutoff: " + Math.round(cutoff)});
					    break;	
					case 'resonance':
						var resonance = K2.MathUtils.linearRange (0, 1, 0, 127, value);
						this.MSS.setResonance(resonance);
						this.ui.setValue({elementID: "statusLabel", value: "Resonance: " + Math.round(resonance)});
					    break;	
					
				}
                
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
        
        var whiteInit = 44;
        var whiteSpacing = 165;
        var blackInit = 347;
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
                knobArgs.left = (blackInit + (i - 3) * blackSpacing);
            }
             
            this.ui.addElement(new K2.RotKnob(knobArgs));
            var initValue = currKnob.init;
            this.ui.setValue ({elementID: knobArgs.ID, value: initValue});
        }    
        this.ui.setValue({elementID: "statusLabel", value: "MorningStar ready."});    
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
                    'image!'+ require.toUrl('./assets/images/keywhite_down.png'),
                    'font!google,families:[VT323]',
                    ],
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