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
        var context = this.context;
        /* From 40 to 100 */
        this.baseNote = 44;
        /* From 1 to 40 */
        this.nOsc = 14;
        
        //connect gain
        var gain = context.createGainNode();
        gain.gain.value = 15.0;
        gain.connect(this.audioDestination);
        
        var noiseNodes = [];
        var bufferLen = 4096;
        
        function createNoiseGen(freq) {
          var panner = context.createPanner();
          var max = 20;
          var min = -20;
          var x = rand(min, max);
          var y = rand(min, max);
          var z = rand(min, max);
          panner.setPosition(x, y, z);
          panner.connect(gain);
        
          var filter = context.createBiquadFilter();
          filter.type = filter.BANDPASS;
          filter.frequency.value = freq;
          filter.Q.value = 150;
          filter.connect(panner);
        
          var noiseSource = context.createJavaScriptNode(bufferLen, 1, 2);
          noiseSource.onaudioprocess = function (e) {
            var outBufferL = e.outputBuffer.getChannelData(0);
            var outBufferR = e.outputBuffer.getChannelData(1);
            for (var i = 0; i < bufferLen; i++) {
              outBufferL[i] = outBufferR[i] = Math.random() * 2 - 1;
            }
          };
          noiseSource.connect(filter);
          noiseNodes.push(noiseSource);
        
          setInterval(function () {
            x = x + rand(-0.1, 0.1);
            y = y + rand(-0.1, 0.1);
            z = z + rand(-0.1, 0.1);
            panner.setPosition(x, y, z);
          }, 500);
        
        }
        
        var scale = [0.0, 2.0, 4.0, 6.0, 7.0, 9.0, 11.0, 12.0, 14.0];
        
        function generate(){
          var base_note = this.baseNote;
          var num_osc = this.nOsc;
          for (var i = 0; i < num_osc; i++) {
            var degree = Math.floor(Math.random() * scale.length);
            var freq = mtof(base_note + scale[degree]);
            freq += Math.random() * 4 - 2;
            createNoiseGen(freq);
          }
        }
        
        function mtof(m) {
          return Math.pow(2, (m - 69) / 12) * 440;
        }
        
        function rand(min, max) {
          return Math.random() * (max - min) + min;
        }
        
        function reset(){
          while (noiseNodes.length){
            noiseNodes.pop().disconnect();
          }
          generate();
        }
        
        generate();
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

