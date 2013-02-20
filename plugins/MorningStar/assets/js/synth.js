function MorningStarSynth() {
}

MorningStarSynth.synth = {
    phase : 0,
    freq : 440,
    tfreq : 440,
    amp : 0,
    env : 0,
    fcutoff : 0,
    fspeed : 0,
    fpos : 0,
    freso: 0,
    lastsample : 0,
    /* int */          noteson : 0,
    /* unsigned int */ vel : 0,
    /* unsigned int */ cdelay : 0,
    /* unsigned int */ release : 100,
    /* unsigned int */ cutoff : 50,
    /* unsigned int */ envmod : 80,
    /* unsigned int */ resonance : 100,
    /* unsigned int */ volume : 100,
    /* unsigned int */ portamento : 64,
    dist : 0
};

MorningStarSynth.synth.tanh = function (arg) {
    return (Math.exp(2 * arg) - 1) / (Math.exp(2 * arg) + 1);
}

MorningStarSynth.synth.process = function (data) {

var /*int*/ i;

// Upmix to stereo if given two channels (array of arrays). Could be implemented
// more elegantly.
var len = data.length;
if (len == 2) len = data[0].length;

    if (this.bypass === false) {
        for( i = 0; i < len; i+=1) {
            if(this.cdelay <= 0) {

                this.freq = ((this.portamento / 127) * 0.9) * this.freq + (1 - ((this.portamento / 127) * 0.9)) * this.tfreq;

                if(this.noteson > 0) {
                    this.amp *= 0.99;
                }
                else {
                    this.amp *= 0.5;
                }

                this.env *= 0.8 + Math.pow (this.release / 127, 0.25) / 5.1;
                this.fcutoff = Math.pow (this.cutoff / 127, 2) + Math.pow (this.env, 2) * Math.pow (this.envmod / 127, 2);
                this.fcutoff = this.tanh(this.fcutoff);
                this.freso = Math.pow (this.resonance / 130, 0.25);
                this.cdelay = Math.floor(this.sampleRate / 100);
            }
            this.cdelay--;

            this.max = this.sampleRate / this.freq;
            this.sample = (this.phase / this.max) * (this.phase / this.max) - 0.25;
            this.phase++;
            if( this.phase >= this.max )
            this.phase -= this.max;

            if (this.vel > 100) {
                this.sample *= this.env;
            }
            else {
                this.sample *= this.amp;
            }

            this.fpos += this.fspeed;
            this.fspeed *= this.freso;
            this.fspeed += (this.sample - this.fpos) * this.fcutoff;
            this.sample = this.fpos;

            this.sample = this.sample * 0.5 + this.lastsample * 0.5;
            this.lastsample = this.sample;
            
            if (this.IMPLEMENT_DISTORTION === true) {
                // 0-value gives no distortion, bypass expilicitly.
                if ((this.dist >= 0) && (this.dist < 1)) {
                    var k = 2 * this.dist / (1 - this.dist);
                    this.sample += (1 + k) * this.sample / (1+ k * Math.abs(this.sample));
                }
            }
            
            // Velocity control does nothing, had to use it as a gain here.
            var curr_sample = this.sample * (this.volume / 127) * (this.vel / 127) ;
            
            // Upmix to stereo if given two channels (array of arrays)
            if (data.length === 2) {
                data[0][i] = 0.707 * curr_sample;
                data[1][i] = 0.707 * curr_sample;
            }
            
            // Mono if given only one channel (array)
            else {
                data[i] = curr_sample; 
            }
            
        }
    }
}

MorningStarSynth.synth.init = function (sampleRate) {
    this.sampleRate = sampleRate;
    this.phase = 0;
    this.freq = 440;
    this.tfreq = 440;
    this.amp = 0;
    this.fcutoff = 0;
    this.fspeed = 0;
    this.fpos = 0;
    this.lastsample = 0;
    this.noteson = 0;
    this.cdelay = Math.floor(sampleRate / 100);

    /* These are to be set externally */
    this.release = 100;
    this.cutoff = 50;
    this.envmod = 80;
    this.resonance = 100;
    this.volume = 100;
    this.portamento = 64;
}

MorningStarSynth.prototype.setConvoBuffer = function (response) {
    this.response = response;
}

MorningStarSynth.prototype.createWSCurve = function (amount, n_samples) {
    
    if ((amount >= 0) && (amount < 1)) {
        
        MorningStarSynth.synth.dist = amount;

        var k = 2 * MorningStarSynth.synth.dist / (1 - MorningStarSynth.synth.dist);

        for (var i = 0; i < n_samples; i+=1) {
            // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
            // a = 0, b = 2048, z = 1, y = -1, c = i
            var x = (i - 0) * (1 - (-1)) / (n_samples - 0) + (-1);
            this.wsCurve[i] = (1 + k) * x / (1+ k * Math.abs(x));
        }
   
    }
}

MorningStarSynth.prototype.process = function(event) {
    // Get left/right input and output arrays
    var outputArray = [];
    outputArray[0] = event.outputBuffer.getChannelData(0);
    outputArray[1] = event.outputBuffer.getChannelData(1);
    
    MorningStarSynth.synth.process (outputArray);
}

MorningStarSynth.prototype.init = function (audioParameters, context) {
 
    this.nSamples = 2048;
    this.wsCurve = new Float32Array(this.nSamples);

    this.context = context;
    
    

    this.setDistortion(0);
    MorningStarSynth.synth.init(this.context.sampleRate);

    this.source = this.context.createJavaScriptNode(this.nSamples);
    this.source.onaudioprocess = this.process;

    // Create the convolution buffer from the impulse response
    this.buffer = this.context.createBuffer(this.response, false);
    console.log("convolution buffer passed");
    this.convolver = this.context.createConvolver();
    this.convolver.buffer = this.buffer;
    
    // Create the sigmoid curve for  the waveshaper.
    this.createWSCurve(MorningStarSynth.synth.dist, this.nSamples);
    this.sigmaDistortNode = this.context.createWaveShaper();
    this.sigmaDistortNode.curve = this.wsCurve;
    this.sigmaDistortNode.connect(this.convolver);

    this.source.connect(this.sigmaDistortNode);

    // This gain note is not used at the moment. TODO.
    this.gainNode = this.context.createGainNode();
    this.convolver.connect(this.gainNode);

    this.sigmaDistortNode.connect(this.context.destination);
    this.gainNode.connect(this.context.destination);
    
};

MorningStarSynth.prototype.noteOn = function (noteNum, velocity) {
    console.log("note received is ", noteNum);
    if(MorningStarSynth.synth.noteson === 0) {
        MorningStarSynth.synth.freq = MorningStarSynth.synth.tfreq = 440 * Math.pow(2, (noteNum) / 12);
        MorningStarSynth.synth.amp = 1;
        MorningStarSynth.synth.vel = velocity;
        MorningStarSynth.synth.env = MorningStarSynth.synth.vel / 127;
        MorningStarSynth.synth.cdelay = 0;
    }

    else {
        MorningStarSynth.synth.tfreq = 440.0 * Math.pow (2, (noteNum) / 12);
    }
    MorningStarSynth.synth.noteson += 1;
}

MorningStarSynth.prototype.noteOff = function (noteNum) {
    MorningStarSynth.synth.noteson -= 1;
    if (MorningStarSynth.synth.noteson < 0) {
        MorningStarSynth.synth.noteson = 0;
    }
}

MorningStarSynth.prototype.setCutoff = function (cutoffValue) {
    MorningStarSynth.synth.cutoff = cutoffValue;
}

MorningStarSynth.prototype.setResonance = function (resValue) {
    MorningStarSynth.synth.resonance = resValue;
}

MorningStarSynth.prototype.setPortamento = function (portValue) {
    MorningStarSynth.synth.portamento = portValue;
}

MorningStarSynth.prototype.setRelease = function (relValue) {
    MorningStarSynth.synth.release = relValue;
}

MorningStarSynth.prototype.setEnvelope = function (envValue) {
    MorningStarSynth.synth.envmod = envValue;
}

MorningStarSynth.prototype.setVolume = function (volValue) {
    MorningStarSynth.synth.volume = volValue;
}

MorningStarSynth.prototype.setBypass = function (bypassON) {
    MorningStarSynth.synth.bypass = bypassON;
}

MorningStarSynth.prototype.setReverb = function (revValue) {
    this.gainNode.gain.value = revValue;
}

MorningStarSynth.prototype.setDistortion = function (distValue) {
    var distCorrect = distValue;
    if (distValue < -1) {
        distCorrect = -1;
    }
    if (distValue >= 1) {
        distCorrect = 0.985;
    }
    this.createWSCurve (distCorrect, this.nSamples);
}