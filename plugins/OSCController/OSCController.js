define(['require'], function(require) {

    /* This gets returned to the host as soon as the plugin is loaded */ 
    var pluginConf = {
        osc: true,
        audioIn: 1,
        audioOut: 0,
        canvas: {
            width: 520,
            height: 364
        },
    };
  
    /* This gets called when all the resources are loaded */
    var pluginFunction = function (args, resources) {
        
        this.canvas = args.canvas;
        
        this.createModalWindow = function () {
            var canvas = $(this.canvas);
            var padding = 5;
            var border = 2;
            var top = canvas[0].offsetTop;
            var zindex = canvas.css("z-index") + 1;
            var offset = padding * 2 + border;
            var CWidth = canvas.width();
            var CHeight = canvas.height();
            
            var modalStyle = "position:absolute; left:0px; top:" + top + "px; width:" + (CWidth - offset) + "px; height:" + (CHeight - offset) + "px; z-index:" + zindex + "; background-color: rgba(0, 0, 0, 0.77); color: whitesmoke; border: " + border + "px solid whitesmoke; padding: " + padding + "px";
            
            // Modal
            var modalHTML = '<div style="' + modalStyle + '">\
                <form>\
                    <fieldset>\
                        <legend style="color:whitesmoke">Controller parameters</legend>\
                        <label>Label name</label>\
                        <input type="text" placeholder="Label name...">\
                        <label>Control value range</label>\
                        <input class="input-mini" type="text" placeholder="0"><span class="help-inline"> Start value   </span>\
                        <input class="input-mini" type="text" placeholder="1"><span class="help-inline"> End value   </span>\
                        <label>Send OSC to:</label>\
                        <select>\
                            <option>1</option>\
                            <option>2</option>\
                            <option>3</option>\
                            <option>4</option>\
                            <option>5</option>\
                        </select>\
                        <hr/>\
                        <button type="submit" class="btn">Ok</button>\
                    </fieldset>\
                 </form>\
             </div>';
            
            var modalElement = $(modalHTML);
            var parent = canvas.parent();
            parent.append(modalHTML);
        }
		
		
        // The canvas part
        this.ui = new K2.UI ({type: 'CANVAS2D', target: args.canvas});
		
        /* deck */
		var deckImage = resources [3];
       	var bgArgs = new K2.Background({
        	ID: 'background',
            image: deckImage,
            top: 0,
            left: 0
        });
    
        this.ui.addElement(bgArgs, {zIndex: 0});
		
		var nKNobs = 6;
		var nButtons = 12;
		var buttonsPerRow = 6;
		
		var knobImage = resources[0];
		var buttonImages = [resources[4], resources[5]];
		var knobLeft = 18;
		var knobSpacing = 84;
		var buttonLeft = 18;
		var buttonSpacing = 84;
		var buttonTop = 140;
		var buttonYSpacing = 120;
		
        var knobArgs = {
             imagesArray : [knobImage],
             tileWidth: 64,
             tileHeight: 64,
             imageNum: 64,
             bottomAngularOffset: 33,
             ID: "",
             left: 0,
             top: 14,
             onValueSet: function(slot, value) {
                 this.ui.refresh();
             }.bind(this),
             isListening : true
         };
		 for (var i = 0; i < nKNobs; i +=1) {
             knobArgs.ID = 'knob' + i;
             knobArgs.left = (knobLeft + i * knobSpacing);
             this.ui.addElement(new K2.Knob(knobArgs));
		 }
		 
		 var buttonArgs = {
             ID: "",
             left: 0,
             top: 0,
             /*mode: 'immediate',*/
             imagesArray : buttonImages,
             onValueSet: function (slot, value) {
                 this.ui.refresh();
             }.bind(this),
             isListening: true
		 }
		 for (var i = 0; i < nButtons; i +=1) {
             buttonArgs.ID = 'button' + i;
             buttonArgs.left = (buttonLeft + (i % buttonsPerRow) * buttonSpacing);
			 buttonArgs.top = buttonTop + Math.floor(i / buttonsPerRow) * buttonYSpacing;
             this.ui.addElement(new K2.Button(buttonArgs));
		 }
		 
		 this.ui.refresh();
	 }
  
    /* This function gets called by the host every time an instance of
       the plugin is requested [e.g: displayed on screen] */        
    var initPlugin = function(initArgs) {
        var args = initArgs;
        require ([  'image!'+ require.toUrl('./assets/images/LittlePhatty.png'),
                    'image!'+ require.toUrl('./assets/images/button_off.png'),
                    'image!'+ require.toUrl('./assets/images/button_on.png'),
                    'image!'+ require.toUrl('./assets/images/OSCDeck.png'),
                    'image!'+ require.toUrl('./assets/images/white_button.png'),
					'image!'+ require.toUrl('./assets/images/red_button.png'),
					],
                    function () {
                        var resources = arguments;
                        pluginFunction.call (this, args, resources);
                    }.bind(this),
                    function (err) {
                        console.error ("Error loading resources");
                        var failedId = err.requireModules && err.requireModules[0]
                        requirejs.undef(failedId);
                        args.K2HInterface.pluginError (args.id, "Error loading resources");
                    });
    };
      
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});