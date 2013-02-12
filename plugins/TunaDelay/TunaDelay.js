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
        
        var delay = new tuna.Delay({
                feedback: 0.45,    //0 to 1+
                delayTime: 150,    //how many milliseconds should the wet signal be delayed? 
                wetLevel: 0.25,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 20,        //cutoff frequency of the built in highpass-filter. 20 to 22050
                bypass: 0
       });
    
       this.audioSource.connect(delay.input);
       delay.connect(this.audioDestination); 

    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});