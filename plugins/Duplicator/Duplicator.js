define(['kievII'/*,
        'image!'+ require.toUrl('image.png'),*/
        ], function(k2, img) {
            
  //var image =  img;
  
  var pluginConf = {
      osc: true,
      audioOut: 2,
      audioIn: 1,
      canvas: false,
  };
  
    var initPlugin = function(args) {
        console.log ("plugin inited, args is", args, "KievII object is ", K2);
        
        this.name = args.name;
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestinations = args.audioDestinations;
        this.context = args.audioContext;
		this.gainDuplicatorNodes = [];

	    for (var i = 0; i < this.audioDestinations.length; i+=1) {
	        this.gainDuplicatorNodes[i] = this.context.createGainNode();
			this.audioSource.connect(this.gainDuplicatorNodes[i]);
			this.gainDuplicatorNodes[i].connect(this.audioDestinations[i]);
		}
        
    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});