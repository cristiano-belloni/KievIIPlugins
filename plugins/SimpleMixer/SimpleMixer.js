define(['kievII',
        'image!'+ require.toUrl('assets/images/vsliderhandle_50.png'),
        'image!'+ require.toUrl('assets/images/vsliderslot_200.png'),
        'image!'+ require.toUrl('assets/images/lmh_series.png'),
        'image!'+ require.toUrl('assets/images/trim_series.png'),
        ], function(k2, faderImg, slotImg, blackKnobImg, redKnobImg) {
        var faderImage =  faderImg;
        var slotImage =  slotImg;
        var blackKnobImage =  blackKnobImg;
        var redKnobImage = redKnobImg;
        var nOfChannels = 4;
  var pluginConf = {
      osc: true,
      audioIn: nOfChannels,
      audioOut: 1,
      canvas: {
          width: 450,
          height: 600
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
    this.trimNodes = [];
    
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
         
         this.trimNodes[i] = context.createGainNode();
         this.trimNodes[i].gain.value = 1;
        
         // Create and connect the filter chain
         this.gainMixerNodes[i].connect(this.lowFilters[i]);
         this.lowFilters[i].connect(this.midFilters[i]);
         this.midFilters[i].connect(this.highFilters[i]);
         this.highFilters[i].connect(this.trimNodes[i]);
         this.trimNodes[i].connect (this.audioDestination);
    }
    
    // The canvas part
    this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
    
    this.viewWidth = args.canvas.width;
    this.viewHeight = args.canvas.height;
    
    var idPrefix = "gainFader";
    
    var spaceWidth = 15;
    
    /* slider */
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
    
    for (var i = 0; i < nOfChannels; i += 1) {
        vSliderArgs.ID = idPrefix + i;
        vSliderArgs.left = (i * faderImage.width + (i+1) * spaceWidth);
        this.ui.addElement(new K2.Slider(vSliderArgs));
        this.ui.setValue ({elementID: vSliderArgs.ID, value: 0.5});
    }
    
    /* Channel knobs */
    var knobArgs = {
         ID: "",
         left: spaceWidth,
         top: 200,
         sensitivity : 5000,
         tileWidth: 50,
         tileHeight: 50,
         imageNum: 50,
         bottomAngularOffset: 33,
         onValueSet: function (slot, value, element) {
             var index, realValue;
             if (element.indexOf("lowKnob") === 0) {
                 // Filter gain
                 realValue = K2.MathUtils.linearRange (0, 1, -12, 12, value);
                 index = element.split("lowKnob")[1];
                 index = parseInt(index, 10);
                 this.lowFilters[index].gain.value = realValue;
                 console.log ("L: index, value, realValue", index, value, realValue);
             }
             else if (element.indexOf("midKnob") === 0) {
                 // Filter gain
                 realValue = K2.MathUtils.linearRange (0, 1, -12, 12, value);
                 index = element.split("midKnob")[1];
                 index = parseInt(index, 10);
                 this.midFilters[index].gain.value = realValue;
                 console.log ("M: index, value, realValue", index, value, realValue);
             }
             else if (element.indexOf("hiKnob") === 0) {
                 // Filter gain
                 realValue = K2.MathUtils.linearRange (0, 1, -12, 12, value);
                 index = element.split("hiKnob")[1];
                 index = parseInt(index, 10);
                 this.highFilters[index].gain.value = realValue;
                 console.log ("H: index, value, realValue", index, value, realValue);
             }
             else if (element.indexOf("trimKnob") === 0) {
                 // Trim gain
                 if (value < 0.5) {
                     realValue = K2.MathUtils.linearRange (0, 0.5, 0, 1, value);
                 }
                 else {
                    realValue = K2.MathUtils.linearRange (0.5, 1, 1, 12, value);
                 }
                 index = element.split("trimKnob")[1];
                 index = parseInt(index, 10);
                 this.trimNodes[index].gain.value = realValue;
                 console.log ("T: index, value, realValue", index, value, realValue);
             }
             else {
                 console.error ("Cannot parse element", element);
             }
             this.ui.refresh();
         }.bind(this),
         isListening: true
     };
     
     var id_lmh = ["trimKnob", "hiKnob", "midKnob", "lowKnob"];
     
     for (var knobtype = 0; knobtype < id_lmh.length; knobtype += 1) {
         knobArgs.top = 240 + knobArgs.tileWidth * knobtype;
         if (id_lmh[knobtype] === "trimKnob") {
                knobArgs.imagesArray = [redKnobImage];
            }
            else {
                knobArgs.imagesArray = [blackKnobImage];
            }
         for (i = 0; i < nOfChannels; i += 1) {
            knobArgs.ID = id_lmh[knobtype] + i;
            knobArgs.left = (i * knobArgs.tileHeight + (i+1) * spaceWidth);
            this.ui.addElement(new K2.Knob(knobArgs));
            this.ui.setValue ({elementID: knobArgs.ID, value: 0.5});
        }
    }
    
     this.ui.refresh();        
      
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});