define(['kievII'], function() {
  var pluginConf = {
      osc: true,
      audioIn: 8,
      audioOut: 1,
      canvas: {
          width: 450,
          height: 300
      },
  }
  var initPlugin = function(args) {
    this.name = args.name;
    this.id = args.id;
    
    // The sound part
    this.audioSources = args.audioSources;
    this.audioDestination = args.audioDestinations[0];
    this.context = args.audioContext;
    var context = this.context;
    this.gainMixerNodes = [];
    this.lowFilters = [];
    this.midFilters = [];
    this.highFilters = [];
    
    
    
    for (var i = 0; i < this.audioSources.length; i+=1) {
        this.gainMixerNodes[i] = context.createGainNode();
        this.audioSources[i].connect(this.gainMixerNodes[i]);
        
        this.lowFilters[i] = context.createBiquadFilter(),
        this.midFilters[i] = context.createBiquadFilter(),
        this.highFilters[i] = context.createBiquadFilter();
    
         // Set the filter types (you could set all to 5, for a different result, feel free to experiment)
         // Set the filter gains to  0 (gain = boost in dB)
         this.lowFilters[i].type = 3;
         this.lowFilters[i].gain.value = 0;
         this.lowFilters[i].frequency.value = 80;
         this.midFilters[i].type = 5;
         this.midFilters[i].gain.value = 0;
         this.midFilters[i].frequency.value = 1000;
         this.highFilters[i].type = 4;
         this.highFilters[i].frequency.value = 8000;
         this.highFilters[i].gain.value = 0;
        
         // Create and connect the filter chain
         this.gainMixerNodes[i].connect(this.lowFilters[i]);
         this.lowFilters[i].connect(this.midFilters[i]);
         this.midFilters[i].connect(this.highFilters[i]);
         this.highFilters[i].connect(this.audioDestination);
    }
    
    // The canvas part
    this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
    
    this.viewWidth = args.canvas.width;
    this.viewHeight = args.canvas.height;
    
    var barWidth =  Math.floor(this.viewWidth / 80 * 8);
    var spaceWidth = Math.floor(this.viewWidth / 90 * 2);
    
    var idPrefix = "gainClickBar";
    
    var clickBarArgs = {
        ID: "",
        left : 0,
        top : this.viewHeight / 5,
        height: this.viewHeight / 5 * 3,
        width: barWidth,
        onValueSet: function (slot, value, element) {
            var index = element.split(idPrefix)[1];
            index = parseInt(index, 10);
            var audioNode = this.gainMixerNodes[index];
            audioNode.gain.value = value;
            this.ui.refresh();
        }.bind(this),
        isListening: true
    };
    
    for (var i = 0; i < 8; i += 1) {
        clickBarArgs.ID = idPrefix + i;
        clickBarArgs.left = (i * barWidth + (i+1) * spaceWidth);
        this.ui.addElement(new K2.ClickBar(clickBarArgs));
        this.ui.setValue ({elementID: clickBarArgs.ID, slot: 'barvalue', value: 0.5});
    }        
      
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});