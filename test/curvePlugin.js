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
    
    this.viewWidth = args.canvas.width;
    this.viewHeight = args.canvas.height;
    
    this.handler = args.OSCHandler;
    
    var oscCallback = function (message) {
           console.log ("curvePlugin received message: ", message);
           // From clickbar to curve 
           // Message is like: ["/curve/set/", 0, 0.3013245165348053]
           var dest = message[0];
           if (dest === '/curve/set/') {
               var elNumber = message[1];
               var cuValue = message[2];
               var pointValue = (( 1 - cuValue ) * this.viewHeight);
               if (!this.ui.isElement('testCurve')) {
                   console.log ('Curve element not initialized yet, this is normal');
                   return;
               }
               var curveElement = this.ui.getElement('testCurve');
               var oldPoints =curveElement.values.points; 
               oldPoints[elNumber][1] = pointValue;
               this.ui.setValue ({  slot: 'points', value: oldPoints,
                                        elementID: 'testCurve',
                                        fireCallback: false  });
               this.ui.refresh();
           }
    };
        
    this.localClient = this.handler.registerClient ({ clientID : "curvePlugin",
                                                      oscCallback : oscCallback.bind (this)
                                                    });
    var initialPoints = [0.4, 0.6, 0.2, 0.4]; 
    
    var curveArgs = {
            ID: "testCurve",
            top: 0,
            left: 0,
            width: this.viewWidth,
            height: this.viewHeight,
            curveType: "bezier",
            curveColor: "SteelBlue",
            thickness: this.viewWidth * 0.01,
            paintTerminalPoints: 'all',
            points: [this.viewWidth * 0.1 ,   this.viewHeight - this.viewHeight * initialPoints[0],
                     this.viewWidth * 0.3,    this.viewHeight - this.viewHeight * initialPoints[1],
                     this.viewWidth * 0.6,    this.viewHeight - this.viewHeight * initialPoints[2],
                     this.viewWidth * 0.9,    this.viewHeight - this.viewHeight * initialPoints[3],
                     ],
            onValueSet: function (slot, value, element) {
                if (slot === 'points') {
                    for (var i = 0; i < value.length; i+=1) {
                        var clValue = ((this.viewHeight - value[i][1]) / this.viewHeight);
                        if (isNaN(clValue)) {
                            debugger;
                        }
                        console.log (value[i][1], this.viewHeight, clValue);
                        var msg = new K2.OSC.Message('/click/set/', i, clValue);
                        this.localClient.sendOSC(msg);
                    }
                }
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
    
    this.ui.addElement(new K2.Curve(curveArgs));
    this.ui.refresh();
    return this;   
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});