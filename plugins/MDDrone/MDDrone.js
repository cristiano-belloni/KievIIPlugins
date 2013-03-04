define(['require'], function(require) {
  
    var pluginConf = {
        osc: true,
        audioOut: 1,
        audioIn: 0,
        canvas: {
            width: 274,
            height: 180
        },
    };
  
    var pluginFunction = function (args, resources) {
        
        this.name = args.name;
        this.id = args.id;
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        var knobImage =  resources[0];
		var deckImage =  resources[1];
        
        /* From 40 to 100 */
        this.baseNote = 44;
        /* From 1 to 40 */
        this.nOsc = 14;
        
        //connect gain
        this.gainNode = this.context.createGainNode();
        this.gainNode.gain.value = 15.0;
        this.gainNode.connect(this.audioDestination);
        
        this.noiseNodes = [];
        this.noiseFilters = [];
        this.bufferLen = 4096;
        
        this.createNoiseGen = function (freq) {
          this.panner = this.context.createPanner();
          var max = 20;
          var min = -20;
          var x = rand(min, max);
          var y = rand(min, max);
          var z = rand(min, max);
          this.panner.setPosition(x, y, z);
          this.panner.connect(this.gainNode);
        
          var filter = this.context.createBiquadFilter();
          filter.type = filter.BANDPASS;
          filter.frequency.value = freq;
          filter.Q.value = 150;
          filter.connect(this.panner);
        
          var noiseSource = this.context.createJavaScriptNode(this.bufferLen, 1, 2);
          noiseSource.onaudioprocess = function (e) {
            var outBufferL = e.outputBuffer.getChannelData(0);
            var outBufferR = e.outputBuffer.getChannelData(1);
            for (var i = 0; i < this.bufferLen; i++) {
              outBufferL[i] = outBufferR[i] = Math.random() * 2 - 1;
            }
          }.bind(this);
          noiseSource.connect(filter);
          this.noiseNodes.push(noiseSource);
          this.noiseFilters.push(filter);

          setInterval(function () {
            x = x + rand(-0.1, 0.1);
            y = y + rand(-0.1, 0.1);
            z = z + rand(-0.1, 0.1);
            this.panner.setPosition(x, y, z);
          }.bind(this), 500);
        
        }
        
        this.scale = [0.0, 2.0, 4.0, 6.0, 7.0, 9.0, 11.0, 12.0, 14.0];
        
        this.generate = function () {
          var base_note = this.baseNote;
          var num_osc = this.nOsc;
          for (var i = 0; i < num_osc; i++) {
            var degree = Math.floor(Math.random() * this.scale.length);
            var freq = mtof(base_note + this.scale[degree]);
            freq += Math.random() * 4 - 2;
            this.createNoiseGen(freq);
          }
        };
        
        function mtof(m) {
          return Math.pow(2, (m - 69) / 12) * 440;
        }
        
        function rand(min, max) {
          return Math.random() * (max - min) + min;
        }
        
        this.reset = function () {
          while (this.noiseNodes.length){
            this.noiseNodes.pop().disconnect();
          }
          while (this.noiseFilters.length) {
            this.noiseFilters.pop().disconnect();
          }
          this.generate();
        }
        
        this.generateWithParams = function(note, voices) {
            if (typeof voices === 'number') {
                this.baseNote = note;
            }
            if (typeof voices === 'number') {
                this.nOsc = voices;
            }
            this.reset();
        }
        
        this.changeNote = function(note) {
            
            var len = this.noiseFilters.length;
            
            if (len === 0) {
                this.generateWithParams (note);
                return;
            }
            
            this.baseNote = note;
            
            for (var i = 0; i < len; i+=1) {
                var degree = Math.floor(Math.random() * this.scale.length);
                var freq = mtof(this.baseNote + this.scale[degree]);
                freq += Math.random() * 4 - 2;
                this.noiseFilters[i].frequency.value = freq;
            }
            
        }
        
        this.changeVoices = function(voices) {
            this.nOsc = voices;
            this.reset();
        }
        
        //this.generate();
        
        /*this.sign = "plus";
        var testFunc = function () {
            if (this.baseNote === 100) {
                this.sign = "minus";
            }
            if (this.baseNote === 40) {
                this.sign = "plus";
            }
            if (this.sign === "plus") {
                console.log ("changing note to", this.baseNote + 1);
                this.changeNote (this.baseNote + 1);
            }
            if (this.sign === "minus") {
                console.log ("changing note to", this.baseNote - 1);
                this.changeNote (this.baseNote - 1);
            } 
        }.bind(this);
        
        setInterval (testFunc, 300);*/
       
       // The UI
       this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
        
       this.viewWidth = args.canvas.width;
       this.viewHeight = args.canvas.height;
	   
       /* deck */
      var bgArgs = new K2.Background({
           ID: 'background',
           image: deckImage,
           top: 0,
           left: 0
       });
    
       this.ui.addElement(bgArgs, {zIndex: 0});
       
       var noteKnobArgs = {
            imagesArray : [knobImage],
            tileWidth: 60,
            tileHeight: 60,
            imageNum: 61,
            bottomAngularOffset: 33,
            ID: this.name + "noteKnob",
            left: 38,
            top: 57,
            onValueSet: function(slot, value) {            
                var noteValue = Math.round(K2.MathUtils.linearRange(0, 1, 40, 100, value));
                this.changeNote (noteValue);
                this.ui.refresh();
            }.bind(this),
            isListening : true
        };
            
        var voiceKnobArgs = {
                imagesArray : [knobImage],
                tileWidth: 60,
                tileHeight: 60,
                imageNum: 61,
                bottomAngularOffset: 33,
                ID: this.name + "voiceKnob",
                left: 178,
                top: 57,
                onValueSet : function(slot, value) {            
                    var voiceValue = Math.round(K2.MathUtils.linearRange(0, 1, 1, 40, value));
                    this.changeVoices (voiceValue);
                    this.ui.refresh();
                }.bind(this),
                isListening : true
        };
            
        this.ui.addElement(new K2.Knob(noteKnobArgs));
        
        this.ui.setValue({
            elementID : noteKnobArgs.ID,
            slot : 'knobvalue',
            value : K2.MathUtils.linearRange(40, 100, 0, 1, 44)
        });
    
        this.ui.addElement(new K2.Knob(voiceKnobArgs));
        this.ui.setValue({
            elementID : voiceKnobArgs.ID,
            slot : 'knobvalue',
            value : K2.MathUtils.linearRange(1, 40, 0, 1, 14)
        });
        
        this.ui.refresh();
    };
  
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  'image!'+ require.toUrl('./assets/images/knob_60_60_61f.png'),
			 		'image!'+ require.toUrl('./assets/images/MDDDeck.png')],
                    function () {
                        var resources = arguments;
                        pluginFunction.call (this, args, resources);
                    }.bind(this),
                    function (err) {
                        console.error ("Error loading resources");
                        var failedId = err.requireModules && err.requireModules[0];
                        requirejs.undef(failedId);
                        args.K2HInterface.pluginError (args.id, "Error loading resources");
                    }); 
    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});
