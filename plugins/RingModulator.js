define(['kievII'], function() {
  var pluginConf = {
      osc: true,
      audioIn: true,
      audioOut: true
  }
  var initPlugin = function(args) {
    console.log ("plugin inited, args is", args, "KievII object is ", K2);
    
    this.audioSource = args.audioSource;
    this.audioDestination = args.audioDestination;
    this.context = args.audioContext;
    var context = this.context;
    
    DiodeNode = (function() {
    
        function DiodeNode(context) {  
            this.context = context;
            this.node = this.context.createWaveShaper();
            this.vb = 0.2;
            this.vl = 0.4;
            this.h = 1;
            this.setCurve(); 
          }

        DiodeNode.prototype.setDistortion = function(distortion) {
            this.h = distortion;
            return this.setCurve();
        };

        DiodeNode.prototype.setCurve = function() {
          var i, samples, v, value, wsCurve, _i, _ref;
          samples = 1024;
          wsCurve = new Float32Array(samples);
          for (i = _i = 0, _ref = wsCurve.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            v = (i - samples / 2) / (samples / 2);
            v = Math.abs(v);
            if (v <= this.vb) {
              value = 0;
            } else if ((this.vb < v) && (v <= this.vl)) {
              value = this.h * ((Math.pow(v - this.vb, 2)) / (2 * this.vl - 2 * this.vb));
            } else {
              value = this.h * v - this.h * this.vl + (this.h * ((Math.pow(this.vl - this.vb, 2)) / (2 * this.vl - 2 * this.vb)));
            }
            wsCurve[i] = value;
          }
          return this.node.curve = wsCurve;
        };

        DiodeNode.prototype.connect = function(destination) {
          return this.node.connect(destination);
        };
        
        DiodeNode.prototype.getNode = function() {
          return this.node;
        };

        return DiodeNode;

        })();
          
        vIn = context.createOscillator();
        vIn.frequency.value = 4;
        vIn.noteOn(0);
        vInGain = context.createGainNode();
        vInGain.gain.value = 0.5;
        vInInverter1 = context.createGainNode();
        vInInverter1.gain.value = -1;
        vInInverter2 = context.createGainNode();
        vInInverter2.gain.value = -1;
        vInDiode1 = new DiodeNode(context);
        vInDiode2 = new DiodeNode(context);
        vInInverter3 = context.createGainNode();
        vInInverter3.gain.value = -1;
        vcInverter1 = context.createGainNode();
        vcInverter1.gain.value = -1;
        vcDiode3 = new DiodeNode(context);
        vcDiode4 = new DiodeNode(context);
        outGain = context.createGainNode();
        outGain.gain.value = 4;
        compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -12;
        this.audioSource.connect(vcInverter1);
        this.audioSource.connect(vcDiode4.getNode());
        vcInverter1.connect(vcDiode3.node);
        vIn.connect(vInGain);
        vInGain.connect(vInInverter1);
        vInGain.connect(vcInverter1);
        vInGain.connect(vcDiode4.node);
        vInInverter1.connect(vInInverter2);
        vInInverter1.connect(vInDiode2.node);
        vInInverter2.connect(vInDiode1.node);
        vInDiode1.connect(vInInverter3);
        vInDiode2.connect(vInInverter3);
        vInInverter3.connect(compressor);
        vcDiode3.connect(compressor);
        vcDiode4.connect(compressor);
        compressor.connect(outGain);
        outGain.connect(this.audioDestination); 

    return this;   
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});