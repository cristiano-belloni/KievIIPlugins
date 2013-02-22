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
        
        var myTextArea = document.createElement("div");
        myTextArea.id = "CodeEditTextArea";
        
        myTextArea.style.width = canvas.width + "px";
        myTextArea.style.height = canvas.height + "px";
 
        args.canvas.parentNode.replaceChild(myTextArea, args.canvas);
        
        var pn = myTextArea;
        
        var editor = ace.edit(pn);
        editor.setFontSize("14px");
        editor.setTheme("ace/theme/mono_industrial");
        editor.getSession().setMode("ace/mode/javascript");
        
    };
    
    
    var initPlugin = function(initArgs) {
        var args = initArgs;
        
        function loadCss(url) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        }
        
        //loadCss (require.toUrl('./codemirror-3.1/lib/codemirror.css'));
        
        require ([  require.toUrl('assets/js/codemirror-compressed.js'),
                    'http://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace.js'
                 ],
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