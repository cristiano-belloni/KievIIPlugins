define(['kievII',
        'https://github.com/corbanbrook/dsp.js/raw/master/dsp.js',
        'https://github.com/janesconference/KievII/raw/master/dsp/pitchshift.js',
        'image!'+ require.toUrl('assets/images/Voron_bg2.png')], function(k2, dsp, pitchshift, bgImage) {

  var backgroundImage =  bgImage;
  
  var pluginConf = {
      osc: true,
      audioIn: true,
      audioOut: true,
      canvas: {
          width: 766,
          height: 527
      },
  }
  var initPlugin = function(args) {
    console.log ("plugin inited, args is", args, "KievII object is ", K2, "bg image is", backgroundImage);
    
    this.name = args.name;
    this.id = args.id;
    
    // The sound part
    this.audioSource = args.audioSource;
    this.audioDestination = args.audioDestination;
    this.context = args.audioContext;
    var context = this.context;
    
    // The OSC part
    this.OSChandler = args.OSCHandler;
     
    var oscCallback = function (message) {
       console.log (this.id + " received message: ", message);
       var dest = message[0];
       if (dest === this.id + '/bypass/set/') {
           var bypass = message[1];
           if (bypass === true) {
               //TODO
           }
           else if (bypass === false) {
               //TODO
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
    
    this.viewWidth = args.canvas.width;
    this.viewHeight = args.canvas.height;
	
    /* BACKGROUND INIT */
	
    var bg = new K2.Background({
        ID: 'background',
        image: backgroundImage,
        top: 0,
        left: 0
    });

    this.ui.addElement(bg, {zIndex: 0});
    this.ui.refresh();
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});