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
        
         /* This is an hack! */
        
        var CodeArea = document.createElement("div");
        CodeArea.id = "CodeArea";
        
        CodeArea.style.width = pluginConf.canvas.width + "px";
        CodeArea.style.height = pluginConf.canvas.height + "px";
 
        args.canvas.parentNode.replaceChild(CodeArea, args.canvas);
        
        var editor = ace.edit(CodeArea);
        editor.setFontSize("14px");
        editor.setTheme("ace/theme/mono_industrial");
        editor.getSession().setMode("ace/mode/javascript");
        
    };
    
    
    var initPlugin = function(initArgs) {
        var args = initArgs;
        
        require (['http://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace.js'],
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