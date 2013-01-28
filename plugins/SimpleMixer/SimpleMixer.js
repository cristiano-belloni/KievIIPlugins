define(['kievII',
        'image!'+ require.toUrl('assets/images/vsliderhandle_50.png'),
        'image!'+ require.toUrl('assets/images/vsliderslot_200.png')
        ], function(k2, faderImg, slotImg) {
        var faderImage =  faderImg;
        var slotImage =  slotImg;
  var pluginConf = {
      osc: true,
      audioIn: 8,
      audioOut: 1,
      canvas: {
          width: 650,
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
    
    var idPrefix = "gainFader";
    
    var spaceWidth = 15;
    
    vSliderArgs = {
            ID: "",
            left: spaceWidth,
            top : 20,
            sliderImg: slotImage,
            knobImg: faderImage,
            onValueSet: function (slot, value, element) {
                var index = element.split(idPrefix)[1];
                index = parseInt(index, 10);
                var audioNode = this.gainMixerNodes[index];
                audioNode.gain.value = 1 - value;
                this.ui.refresh();
            }.bind(this),
            type:"vertical",
            isListening: true
        };
    
    for (var i = 0; i < 8; i += 1) {
        vSliderArgs.ID = idPrefix + i;
        vSliderArgs.left = (i * faderImage.width + (i+1) * spaceWidth);
        this.ui.addElement(new K2.Slider(vSliderArgs));
        this.ui.setValue ({elementID: vSliderArgs.ID, value: 0.5});
    }        
      
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});