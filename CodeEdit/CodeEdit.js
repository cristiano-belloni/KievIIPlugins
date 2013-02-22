define(['require'], function(require) {
  
    var pluginConf = {
        osc: true,
        audioOut: 1,
        audioIn: 1,
        canvas: {
            width: 600,
            height: 400
        },
    };
  
  
  
    var pluginFunction = function(args, resources) {
        
        this.name = args.name;
        this.id = args.id;
        this.audioSource = args.audioSources[0];
        this.audioDestination = args.audioDestinations[0];
        this.context = args.audioContext;
        var myTextArea = document.createElement("textarea");
        //var button = document.create;
        myTextArea.name = "post";
        myTextArea.maxLength = "5000";
        myTextArea.cols = "80";
        myTextArea.rows = "40";
        //div.appendChild(input); //appendChild
        //div.appendChild(button);
        args.canvas.parentNode.replaceChild(myTextArea, args.canvas);
        
    };
    
    
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  require.toUrl('/codemirror-3.1/lib/codemirror.js'),
                    require.toUrl('/codemirror-3.1/javascript/javascript.js') ]),
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