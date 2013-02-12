define(['require'], function(require) {
    
    /* This gets returned to the host as soon as the plugin is loaded */ 
    var pluginConf = {
        osc: true,
        audioIn: 1,
        audioOut: 1,
        canvas: {
            width: 288,
            height: 193
        },
    }
  
    /* This gets called when all the resources are loaded */
    var pluginFunction = function (args, resources) {
        
        var freqKnobImage = resources[0];
        var distKnobImage = resources[0];
        var deckImage = resources[1];
      
        // Inspired from BBC Ring Modulator: http://webaudio.prototyping.bbc.co.uk/ring-modulator/
        
        this.name = args.name;
        this.id = args.id;
        
        // The sound part
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        var context = this.context;
        
        DiodeNode = (function() {
        
            function DiodeNode(context) {  
                this.context = context;
                this.node = this.context.createWaveShaper();
                this.vb = 0.2;
                this.vl = 0.4;
                this.h = 1;
                this.setCurve(); 
              }
    
            DiodeNode.prototype.setDistortion = function(distortion) {
                this.h = distortion;
                return this.setCurve();
            };
    
            DiodeNode.prototype.setCurve = function() {
              var i, samples, v, value, wsCurve, _i, _ref;
              samples = 1024;
              wsCurve = new Float32Array(samples);
              for (i = _i = 0, _ref = wsCurve.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                v = (i - samples / 2) / (samples / 2);
                v = Math.abs(v);
                if (v <= this.vb) {
                  value = 0;
                } else if ((this.vb < v) && (v <= this.vl)) {
                  value = this.h * ((Math.pow(v - this.vb, 2)) / (2 * this.vl - 2 * this.vb));
                } else {
                  value = this.h * v - this.h * this.vl + (this.h * ((Math.pow(this.vl - this.vb, 2)) / (2 * this.vl - 2 * this.vb)));
                }
                wsCurve[i] = value;
              }
              return this.node.curve = wsCurve;
            };
    
            DiodeNode.prototype.connect = function(destination) {
              return this.node.connect(destination);
            };
            
            DiodeNode.prototype.getNode = function() {
              return this.node;
            };
    
            return DiodeNode;
    
            })();
        
        // Initialize nodes      
        this.vIn = context.createOscillator();
        this.vIn.frequency.value = 0;
        this.vIn.noteOn(0);
        this.vInGain = context.createGainNode();
        this.vInGain.gain.value = 0.5;
        this.vInInverter1 = context.createGainNode();
        this.vInInverter1.gain.value = -1;
        this.vInInverter2 = context.createGainNode();
        this.vInInverter2.gain.value = -1;
        this.vInDiode1 = new DiodeNode(context);
        this.vInDiode2 = new DiodeNode(context);
        this.vInInverter3 = context.createGainNode();
        this.vInInverter3.gain.value = -1;
        this.vcInverter1 = context.createGainNode();
        this.vcInverter1.gain.value = -1;
        this.vcDiode3 = new DiodeNode(context);
        this.vcDiode4 = new DiodeNode(context);
        this.outGain = context.createGainNode();
        this.outGain.gain.value = 4;
        this.compressor = context.createDynamicsCompressor();
        this.compressor.threshold.value = -12;
        
        // Connect nodes
        this.audioSource.connect(this.vcInverter1);
        this.audioSource.connect(this.vcDiode4.getNode());
        this.vcInverter1.connect(this.vcDiode3.node);
        this.vIn.connect(this.vInGain);
        this.vInGain.connect(this.vInInverter1);
        this.vInGain.connect(this.vcInverter1);
        this.vInGain.connect(this.vcDiode4.node);
        this.vInInverter1.connect(this.vInInverter2);
        this.vInInverter1.connect(this.vInDiode2.node);
        this.vInInverter2.connect(this.vInDiode1.node);
        this.vInDiode1.connect(this.vInInverter3);
        this.vInDiode2.connect(this.vInInverter3);
        this.vInInverter3.connect(this.compressor);
        this.vcDiode3.connect(this.compressor);
        this.vcDiode4.connect(this.compressor);
        this.compressor.connect(this.outGain);
        this.outGain.connect(this.audioDestination);
        
        // The OSC part
        this.OSChandler = args.OSCHandler;
         
        var oscCallback = function (message) {
           console.log (this.id + " received message: ", message);
           var dest = message[0];
           if (dest === this.id + '/bypass/set/') {
               var bypass = message[1];
               if (bypass === true) {
                   this.vIn.noteOff(0);
               }
               else if (bypass === false) {
                   this.vIn.noteOn(0);
               }
               else {
                   console.error ("Bypass value not known: ", bypass);
               }
            }
        };
        
        this.localClient = this.OSChandler.registerClient ({ clientID : this.id,
                                                          oscCallback : oscCallback.bind (this)
                                                        });
        
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
        
        var freqKnobArgs = {
                imagesArray : [freqKnobImage],
                sensitivity : 5000,
                tileWidth: 80,
                tileHeight: 80,
                imageNum: 50,
                bottomAngularOffset: 33,
                ID : this.name + "freqKnob",
                left : 30,
                top : 60,
                onValueSet : function(slot, value) {              
                    /* valueMin: 0 valueMax: 2000 */
                    var parValue = value * 2000;
                    parValue = parValue.toFixed(2);
                    if (Math.abs(this.vIn.frequency.value - parValue) > 0.001) {
                        console.log ("Frequency was ", this.vIn.frequency.value, " set to: ", parValue);
                        this.vIn.frequency.value = parValue;
                        console.log ("Frequency is ", this.vIn.frequency.value, " set to: ", parValue);
                        var msg = new K2.OSC.Message(this.id + '/frequency/set/', parValue);
                        this.localClient.sendOSC(msg);
                    }
                    this.ui.refresh();
                    
                }.bind(this),
                isListening : true
            };
            
            var distKnobArgs = {
                    imagesArray : [distKnobImage],
                    sensitivity : 5000,
                    tileWidth: 80,
                    tileHeight: 80,
                    imageNum: 50,
                    bottomAngularOffset: 33,
                    ID : this.name + "distKnob",
                    left : 173,
                    top : 60,
                    onValueSet : function(slot, value) {              
                     
                        var distValue = K2.MathUtils.linearRange(0, 1, 0.2, 50, value);
                        var distNodesArray = [this.vInDiode1, this.vInDiode2, this.vcDiode3, this.vcDiode4];
                        for (var i = 0; i < distNodesArray.length; i+=1) {
                            distNodesArray[i].setDistortion (distValue);
                        }
                                            
                        this.ui.refresh();
                    
                    }.bind(this),
                    isListening : true
                };
            
            
    
        this.ui.addElement(new K2.Knob(freqKnobArgs));
        this.ui.setValue({
            elementID : this.name + 'freqKnob',
            slot : 'knobvalue',
            value : 0.0
        });
    
        this.ui.addElement(new K2.Knob(distKnobArgs));
        this.ui.setValue({
            elementID : this.name + 'distKnob',
            slot : 'knobvalue',
            value : 0.0
        });
        this.ui.refresh();
  };
  
  
    /* This function gets called by the host every time an instance of
       the plugin is requested [e.g: displayed on screen] */        
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  'image!'+ require.toUrl('./assets/images/auxknob_80_50.png'),
                    'image!'+ require.toUrl('./assets/images/deck.png')],
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