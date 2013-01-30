define(['kievII'], function() {
  var pluginConf = {
      osc: true,
      audioIn: 0,
      audioOut: 1,
      canvas: {
          width: 360,
          height: 220
      },
  }
  var initPlugin = function(args) {
    console.log ("plugin inited, args is", args, "KievII object is ", K2);
    
    this.name = args.name;
    this.id = args.id;
    
    // The sound part
    this.audioSource = args.audioSources[0];
    this.audioDestination = args.audioDestinations[0];
    this.audioContext = args.audioContext;
    var audioContext = this.audioContext;
    
    this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
    
    this.viewWidth = args.canvas.width;
    this.viewHeight = args.canvas.height;
    
    this.handler = args.OSCHandler;
    
    var oscCallback = function (message) {
       console.log ("SMP001 received message: ", message);
       var dest = message.toString();
    };
        
    this.localClient = this.handler.registerClient ({ clientID : "OSCSMP001Plugin",
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
    }
    
    this.handleFiles = function (files) {
    
        var file = files[0];
        console.log ("Loading ", file.name);
        var reader = new FileReader();
    
        // init the reader event handlers
        reader.onload = this.handleReaderLoad;
        // begin the read operation
        reader.readAsArrayBuffer(file);
    }
    
    this.successCallback = function (decoded) {
        console.log ("Decode succeeded!");
        
        this.decoded_arrayL = decoded.getChannelData (0);
        this.decoded_arrayR = decoded.getChannelData (1);
        console.log ("I got the data!");
        
        var waveID = 'wavebox_L';
        
        if (!(this.ui.isElement(waveID))) {
        
            // Wavebox parameters
            var waveboxArgs = {
                ID: waveID,
                top: 5,
                left: 5,
                width: this.canvas.width - 5,
                height: this.canvas.height - 5 - 20,
                orientation: 1,
                isListening: true,
                waveColor: '#CC0000',
                transparency: 0.8
            };
            
            waveboxArgs.onValueSet = function () {
                var that = this;
                return function (slot, value) {
                    console.log ("onValueSet callback: slot is ", slot, " and value is ", value, " while that is ", that);
                    this.ui.refresh();
                };
            }();
    
            var waveBox_L = new K2.Wavebox(waveboxArgs);
            this.ui.addElement(waveBox_L);
        }
    
        this.ui.setValue ({elementID: waveID, slot: "waveboxsignal", value: this.decoded_arrayL});     
    
        this.ui.refresh();
        
    }

    this.errorCallback = function () {
        console.log ("Error!");
        alert ("Error decoding ");
    }   
    
    this.handleReaderLoad = function (evt) {
        console.log (evt);
        
        console.log ("Decoding file");
        
        this.audioContext.decodeAudioData(evt.target.result, this.successCallback, this.errorCallback);
        
    }
    
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

    
    return this;   
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});