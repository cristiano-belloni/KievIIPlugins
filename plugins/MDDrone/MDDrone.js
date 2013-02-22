define(['require'], function(require) {
  
    var pluginConf = {
        osc: true,
        audioOut: 1,
        audioIn: 0,
        canvas: false,
    };
  
    var pluginFunction = function (args, resources) {
        
        this.name = args.name;
        this.id = args.id;
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        /* From 40 to 100 */
        this.baseNote = 44;
        /* From 1 to 40 */
        this.nOsc = 14;
        
        //connect gain
        this.gainNode = this.context.createGainNode();
        this.gainNode.gain.value = 15.0;
        this.gainNode.connect(this.audioDestination);
        
        this.noiseNodes = [];
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
          this.generate();
        }
        
        this.generate();
    };
  
    var initPlugin = function(initArgs) {
        var args = initArgs;
        var resources = null;
        pluginFunction.call (this, args, resources);        
    };
    
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});
