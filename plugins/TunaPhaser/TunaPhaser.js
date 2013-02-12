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
        
        var phaser = new tuna.Phaser({
                 rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
                 depth: 0.3,                    //0 to 1
                 feedback: 0.2,                 //0 to 1+
                 stereoPhase: 30,               //0 to 180
                 baseModulationFrequency: 700,  //500 to 1500
                 bypass: 0
             });
    
       this.audioSource.connect(phaser.input);
       phaser.connect(this.audioDestination); 

    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});