define(['require'], function(require) {
  
    var pluginConf = {
        osc: true,
        audioOut: 1,
        audioIn: 1,
        div: {
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
        this.userFunc;
        this.sbSrcAudioNode;
        this.sbDestAudioNode;
        
        function Sandbox (source, dest, context) {
            this.source = source;
            this.dest = dest;
            this.context = context;
        }
        
         /* This is an hack! */
        
        //var CodeArea = document.createElement("div");
        //CodeArea.id = "CodeArea";
        
        //CodeArea.style.width = pluginConf.canvas.width + "px";
        //CodeArea.style.height = pluginConf.canvas.height + "px";
 
        //args.canvas.parentNode.replaceChild(CodeArea, args.canvas);
        
        var editor = ace.edit(args.div);
        editor.setFontSize("14px");
        editor.setTheme("ace/theme/mono_industrial");
        editor.getSession().setMode("ace/mode/javascript");
        editor.setValue("// This is the code to execute");
        
        editor.commands.addCommand({
            name: 'saveCommand',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                console.log ("Intercepted save command, editor is", editor);
                var code = editor.getValue();
                console.log ("And code is", code);
                this.audioSource.disconnect && this.audioSource.disconnect();
                this.sbDstAudioNode && this.sbDstAudioNode.disconnect(); 
                this.sbSrcAudioNode = this.context.createGainNode();
                this.sbDstAudioNode = this.context.createGainNode();
                this.audioSource.connect(this.sbSrcAudioNode);
                this.sbDstAudioNode.connect(this.audioDestination);
                var sandbox = new Sandbox (this.sbSrcAudioNode, this.sbDstAudioNode, this.context);
                var userFunc = Function (code);
                userFunc.call(sandbox);
            }.bind(this),
            readOnly: true // false if this command should not apply in readOnly mode
        });
        
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