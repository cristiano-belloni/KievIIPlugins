define(['kievII'/*,
        'image!'+ require.toUrl('image.png'),*/
        ], function(k2, img) {
            
  //var image =  img;
  
  var pluginConf = {
      osc: true,
      audioOut: 1,
      audioIn: 2,
      canvas: {
          width: 220,
          height: 220
      },
  };
  
    var initPlugin = function(args) {
        console.log ("plugin inited, args is", args, "KievII object is ", K2);
        
        this.name = args.name;
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestinations = args.audioDestinations[0];
        this.context = args.audioContext;
        this.audioSource.connect(this.audioDestination);
        
        // The graphical part
        this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
		// Todo
    
        this.viewWidth = args.canvas.width;
        this.viewHeight = args.canvas.height;
        
	    for (var i = 0; i < this.audioDestinations.length; i+=1) {
	        this.gainDuplicatorNodes[i] = context.createGainNode();
			this.AudioSource.connect(this.gainDuplicatorNodes[i]);
			this.gainDuplicatorNodes[i].connect(this.audioDestinations[i]);
		}
        
    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});