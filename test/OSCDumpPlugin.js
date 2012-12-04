define(['kievII'], function() {
  var pluginConf = {
      canvas: {
          width: 400,
          height: 50
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
       console.log ("OSCDumpPlugin received message: ", message);
       var dest = message.toString();
       this.ui.setValue({
            elementID : 'OSCDumpLabel',
            slot : 'labelvalue',
            value : dest,
            fireCallback: false
        });
       this.ui.refresh();
       
    };
        
    this.localClient = this.handler.registerClient ({ clientID : "OSCDumpPlugin",
                                                      oscCallback : oscCallback.bind (this)
                                                    });
    var fontHeight =  Math.floor(this.viewHeight / 5);
    
    // Label
    var labelArgs = {
        ID: "OSCDumpLabel",
        left : this.viewWidth / 10,
        top : (this.viewHeight - fontHeight) / 2,
        height: this.viewHeight,
        width: this.viewWidth,
        textColor: "yellow",
        transparency: 0.8,
        objParms: {
            font: fontHeight + "pt Arial",
            textBaseline: "top",
            textAlign: "left"
        },
        onValueSet: function (slot, value, element) {
            this.ui.refresh();
        }.bind(this),
        isListening: true
    };
    
    this.ui.addElement(new K2.Label(labelArgs));
    this.ui.refresh();
    return this;   
  };
  return {
    initPlugin: initPlugin,
    pluginConf: pluginConf
  };
});