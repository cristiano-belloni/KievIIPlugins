define(['require'], function(require) {
  
  var pluginConf = {
      osc: true,
      audioOut: 2,
      audioIn: 1,
  };
  
    var initPlugin = function(args) {
        
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