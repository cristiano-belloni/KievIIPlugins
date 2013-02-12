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
        
        var wahwah = new tuna.WahWah({
                 automode: true,                //true/false
                 baseFrequency: 0.5,            //0 to 1
                 excursionOctaves: 2,           //1 to 6
                 sweep: 0.2,                    //0 to 1
                 resonance: 10,                 //1 to 100
                 sensitivity: 0.5,              //-1 to 1
                 bypass: 0
             });
    
       this.audioSource.connect(wahwah.input);
       wahwah.connect(this.audioDestination); 

    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});