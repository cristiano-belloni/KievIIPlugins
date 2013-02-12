define(['require'], function(require) {
  
  var pluginConf = {
      osc: true,
      audioOut: 1,
      audioIn: 1,
      canvas: false,
  };
  
    var initPlugin = function(args) {
        
        this.name = args.name;
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        
        var tuna = new Tuna(this.context);
        
        var tremolo = new tuna.Tremolo({
                  intensity: 0.3,    //0 to 1
                  rate: 0.1,         //0.001 to 8
                  stereoPhase: 0,    //0 to 180
                  bypass: 0
              });
    
       this.audioSource.connect(tremolo.input);
       tremolo.connect(this.audioDestination); 

    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});