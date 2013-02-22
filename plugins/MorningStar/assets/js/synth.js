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
    this.bypass = false;
}

MorningStarSynth.prototype.process = function(event) {
    // Get left/right input and output arrays
    var outputArray = [];
    outputArray[0] = event.outputBuffer.getChannelData(0);
    outputArray[1] = event.outputBuffer.getChannelData(1);
    
    MorningStarSynth.synth.process (outputArray);
}

MorningStarSynth.prototype.init = function (context, destination) {
 
    this.nSamples = 2048;
    this.wsCurve = new Float32Array(this.nSamples);

    this.context = context;

    MorningStarSynth.synth.init(this.context.sampleRate);

    this.source = this.context.createJavaScriptNode(this.nSamples);
    this.source.onaudioprocess = this.process;

    this.gainNode = this.context.createGainNode();
	this.source.connect(this.gainNode);
    this.gainNode.connect(destination);

    
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

// Setters

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
    this.gainNode.gain.value = volValue;
}

MorningStarSynth.prototype.setBypass = function (bypassON) {
    MorningStarSynth.synth.bypass = bypassON;
}

//Getters

MorningStarSynth.prototype.getCutoff = function () {
    return MorningStarSynth.synth.cutoff;
}

MorningStarSynth.prototype.getResonance = function () {
    return MorningStarSynth.synth.resonance;
}

MorningStarSynth.prototype.getPortamento = function () {
    return MorningStarSynth.synth.portamento;
}

MorningStarSynth.prototype.getRelease = function () {
    return MorningStarSynth.synth.release;
}

MorningStarSynth.prototype.getEnvelope = function () {
    return MorningStarSynth.synth.envmod;
}

MorningStarSynth.prototype.getVolume = function () {
    return this.gainNode.gain.value;
}

MorningStarSynth.prototype.getBypass = function () {
    return MorningStarSynth.synth.bypass;
}