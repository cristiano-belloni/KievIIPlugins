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
    
    for (var i = 0; i < audioSources.length; i+=1) {
        this.gainMixerNodes[i] = context.createGainNode();
        this.gainMixerNodes[i].connect(this.audioDestination);
    }
    
    // the canvas part
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
        onValueSet: function (slot, value) {
            var index = this.id.split(idPrefix)[1];
            index = parseInt(index, 10);
            this.gainMixerNodes[index].gain = value;
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