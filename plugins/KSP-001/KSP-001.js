define(['require'], function(require) {
        
    /* This gets returned to the host as soon as the plugin is loaded */        
    var pluginConf = {
        osc: true,
        audioIn: 0,
        audioOut: 1,
        canvas: {
            width: 428,
            height: 348
        }
    }
    
    /* This gets called when all the resources are loaded */
    var pluginFunction = function (args, resources) {
        
        var keyBlackImage = resources[0];
        var keyWhiteImage = resources[1];
        var keyBlackDownImage = resources[2];
        var keyWhiteDownImage = resources[3];
        var deckImage = resources[4];
        
        console.log ("plugin inited, args is", args, "KievII object is ", K2);
        
        this.name = args.name;
        this.id = args.id;
        
        // The sound part
        this.audioDestination = args.audioDestinations[0];
        this.audioContext = args.audioContext;
        var audioContext = this.audioContext;
        
        this.audioBuffer = null; 
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas}, {'breakOnFirstEvent': true});
        
        this.viewWidth = args.canvas.width;
        this.viewHeight = args.canvas.height;
        this.canvas = args.canvas;
        
        this.handler = args.OSCHandler;
        
        var oscCallback = function (message) {
           console.log ("KSP-001 received message: ", message);
           var dest = message.toString();
        };
            
        this.localClient = this.handler.registerClient ({ clientID : "OSCKSP001Plugin",
                                                          oscCallback : oscCallback.bind (this)
                                                        });
        
        // Member methods
        this.drop = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
         
            var files = evt.dataTransfer.files;
            var count = files.length;
         
            // Only call the handler if 1 or more files was dropped.
            if (count > 0)
            this.handleFiles(files);
        }.bind(this);
        
        this.handleFiles = function (files) {
        
            var file = files[0];
            console.log ("Loading ", file.name);
            var reader = new FileReader();
        
            // init the reader event handlers
            reader.onload = this.handleReaderLoad;
            // begin the read operation
            reader.readAsArrayBuffer(file);
        }.bind(this);
        
        this.playFinishedCallback = function () {
            console.log('playback finished');
        }
        this.viewCurrentTime = function (time) {
            console.log(time);
        }
        
        this.successCallback = function (decoded) {
            console.log ("Decode succeeded!");
            
            this.audioBuffer = decoded;
            
            this.decoded_arrayL = decoded.getChannelData (0);
            
            // Todo one has got to check if the signal is mono or stero here
            //this.decoded_arrayR = decoded.getChannelData (1);
            
            console.log ("I got the data!");
            
            var waveID = 'wavebox_L';
            
            if (!(this.ui.isElement(waveID))) {
            
                // Wavebox parameters
                var waveboxArgs = {
                    ID: waveID,
                    top: 35,
                    left: 10,
                    width: this.canvas.width - 10 * 2,
                    height: 148,
                    isListening: true,
                    waveColor: '#CC0000',
                    transparency: 0.8
                };
                
                waveboxArgs.onValueSet = function (slot, value, element) {
                    console.log ("onValueSet callback: slot is ", slot, " and value is ", value, " while el is ", element);
                    this.ui.refresh();
                }.bind(this);
        
                var waveBox_L = new K2.Wavebox(waveboxArgs);
                this.ui.addElement(waveBox_L, {zIndex: 2});
            }
        
            this.ui.setValue ({elementID: waveID, slot: "waveboxsignal", value: this.decoded_arrayL});     
        
            this.ui.refresh();
            
        }.bind(this);
    
        this.errorCallback = function () {
            console.log ("Error!");
            alert ("Error decoding ");
        }.bind(this);   
        
        this.handleReaderLoad = function (evt) {
            console.log (evt);
            
            console.log ("Decoding file");
            
            this.audioContext.decodeAudioData(evt.target.result, this.successCallback, this.errorCallback);
            
        }.bind(this);
        
        // Drop event
        this.noopHandler = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }
        
        // Init event handlers
        this.canvas.addEventListener("dragenter", this.noopHandler, false);
        this.canvas.addEventListener("dragexit", this.noopHandler, false);
        this.canvas.addEventListener("dragover", this.noopHandler, false);
        this.canvas.addEventListener("drop", this.drop, false);
    
        // Background
        var bgArgs = new K2.Background({
            ID: 'background',
            image: deckImage,
            top: 0,
            left: 0
        });
    
        this.ui.addElement(bgArgs, {zIndex: 0});
    
        var keyCallback = function (slot, value, element) {
            
            var stIndex = 0;
            var stPower = 0;
            var whiteKeysSemitones = [0,2,4,5,7,9,11,12,14,16,17,19,21,23];
            var blackKeysSemitones = [1,3,6,8,10,13,15,18,20,22];
            
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
            
            if (this.audioBuffer !== null) {
               if (value === 1) { 
                   this.bSrc = this.audioContext.createBufferSource();
                   this.bSrc.connect (this.audioDestination);
                   this.bSrc.buffer = this.audioBuffer;
                   this.bSrc.playbackRate.value = Math.pow(1.0595, stPower);
                   this.bSrc.loop = false;
				   if (typeof this.bSrc.start !== 'function') {
				       	this.bSrc.noteOn(0);
				   }
				   else {
					   	this.bSrc.start(0);
				   }
                }
                else if (value === 0) {
                    if (this.stopOnLeavingKey) {
	 				   if (typeof this.bSrc.stop !== 'function') {
	 				       	this.bSrc.noteOff(0);
	 				   }
	 				   else {
	 					   	this.bSrc.stop(0);
	 				   }
                        
                    }
                }
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
        
        for (var i = 0; i < 14; i+=1) {
            whiteKeyArgs.top = 204;
            whiteKeyArgs.left = 4 + i * 30;    
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
            
            var bkArray = [24, 54, 114, 144, 174, 234, 264, 324, 354, 384];
        
            for (var i = 0; i < bkArray.length; i+=1) {
                blackKeyArgs.top = 203;
                blackKeyArgs.left = bkArray[i];    
                blackKeyArgs.ID = "bk_" + i;
                this.ui.addElement(new K2.Button(blackKeyArgs), {zIndex: 10});
            }
            this.ui.refresh();
        
        return this;   
    };
    
    /* This function gets called by the host every time an instance of
       the plugin is requested [e.g: displayed on screen] */        
    var initPlugin = function(initArgs) {
        var args = initArgs;
               
        require ([  'image!'+ require.toUrl('./assets/images/keyblack.png'),
                    'image!'+ require.toUrl('./assets/images/keywhite.png'),
                    'image!'+ require.toUrl('./assets/images/keyblack_down.png'),
                    'image!'+ require.toUrl('./assets/images/keywhite_down.png'),
                    'image!'+ require.toUrl('./assets/images/deck.png')],
                    function () {
                        var resources = arguments;
                        pluginFunction.call (this, args, resources);
                    }.bind(this),
                    function (err) {
                        console.error ("Error loading resources");
                        args.K2HInterface.pluginError (args.id, "Error loading resources");
                    });
         };
 
    return {
      initPlugin: initPlugin,
      pluginConf: pluginConf
    };
});