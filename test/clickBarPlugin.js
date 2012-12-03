define(['kievII'], function() {
  var pluginConf = {
      canvas: {
          width: 450,
          height: 300
      },
      osc: true
  }
  var initPlugin = function(args) {
    console.log ("plugin inited, args is", args, "KievII object is ", K2);
    
    this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
    
    this.viewWidth1 = args.canvas.width;
    this.viewHeight1 = args.canvas.height;
    
    this.handler = args.OSCHandler;
    
    var oscCallback = function (message) {
       console.log ("clickBarPlugin received message: ", message);
       // From curve to clickbar
       // Message is like: ["/click/set/", 2, 0.4536423981189728]
       var dest = message[0];
       if (dest === '/click/set/') {
           var elNumber = message[1];
           var clValue = message[2];
           this.ui.setValue ({ slot: 'barvalue', value: clValue,
                               elementID: 'testClickBar' + elNumber,
                                   fireCallback: false});
               this.ui.refresh();
        }
    };
        
    this.localClient = this.handler.registerClient ({ clientID : "clickBarPlugin",
                                                      oscCallback : oscCallback.bind (this)
                                                    });
    var barWidth =  Math.floor(this.viewWidth1 / 40 * 8);
    var spaceWidth = Math.floor(this.viewWidth1 / 50 * 2);
    var initialPoints = [0.4, 0.6, 0.2, 0.4]; 
    
    // clickBar template
    var clickBarArgs = {
        ID: "",
        left : 0,
        top : this.viewHeight1 / 5,
        height: this.viewHeight1 / 5 * 3,
        width: barWidth,
        onValueSet: function (slot, value, element) {
            var msg = new K2.OSC.Message('/curve/set/', parseInt(element['testClickBar'.length], 10), value);
            this.localClient.sendOSC(msg);
            this.ui.refresh();
        }.bind(this),
        isListening: true
    };
    
    // Add 4 clickBars
    for (var i = 0; i < 4; i +=1) {
        clickBarArgs.ID = 'testClickBar' + i;  
        clickBarArgs.left = (i * barWidth + (i+1) * spaceWidth);
        this.ui.addElement(new K2.ClickBar(clickBarArgs));
        this.ui.setValue({
            elementID : clickBarArgs.ID,
            slot : 'barvalue',
            value : initialPoints[i]
        });
    }
    
    this.ui.refresh();
    return this;   
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});