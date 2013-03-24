define(['require'], function(require) {

    /* This gets returned to the host as soon as the plugin is loaded */ 
    var pluginConf = {
        osc: true,
        audioIn: 0,
        audioOut: 0,
        canvas: {
            width: 520,
            height: 364
        },
    };
  
    /* This gets called when all the resources are loaded */
    var pluginFunction = function (args, resources) {
        
        this.canvas = args.canvas;
		this.model = {};
		this.hostInterface = args.K2HInterface;
        
        this.createModalWindow = function (id) {
			console.log ("Element ID is: ", id);
			var description = this.model[id].description;
			var startValue = this.model[id].range[0];
			var endValue = this.model[id].range[1];
			
			var oscList = this.hostInterface.getOSCEnabled();
			var selectMarkup = '<select>';
			selectMarkup += '<option> Remote </option>';
			
			for (var i = 0; i < oscList.length; i+=1) {
                    selectMarkup += '<option>' + oscList[i].displayName + '</option>';
			}
			selectMarkup += '</select>';
			
            var canvas = $(this.canvas);
			
			var okHandler = function (event) {
				// Remove the dialog
				$(this.canvas).siblings(".oscControllerModalDialog").remove();
				console.log (event.data.button_type);
			}
			
            var padding = 5;
            var border = 2;
            var top = canvas[0].offsetTop;
            var zindex = canvas.css("z-index") + 1;
            var offset = padding * 2 + border;
            var CWidth = canvas.width();
            var CHeight = canvas.height();
            
            var modalStyle = "position:absolute; left:0px; top:" + top + "px; width:" + (CWidth - offset) + "px; height:" + (CHeight - offset) + "px; z-index:" + zindex + "; background-color: rgba(0, 0, 0, 0.88); color: whitesmoke; border: " + border + "px solid whitesmoke; padding: " + padding + "px";
            
            // Modal
            var modalHTML = '<div class= "oscControllerModalDialog" style="' + modalStyle + '">\
                <form>\
                    <fieldset>\
                        <legend style="color:whitesmoke">Controller parameters / ' + description + '</legend>\
                        <label>Control value range:</label>\
                        <input class="input-mini" type="number" step="any" placeholder="' + startValue + '"><span class="help-inline"> Start value   </span>\
                        <input class="input-mini" type="number" step="any" placeholder="' + endValue + '"><span class="help-inline"> End value   </span>\
                        <label>Destination:</label>' + selectMarkup + '\
                        <label>Path:</label>\
                        <input type="text" placeholder="/path/to/control/">\
                        <hr/>\
                        <button type="button" class="btn canc_button">Cancel</button>\
                        <button type="button" class="btn ok_button">Ok</button>\
                    </fieldset>\
                 </form>\
             </div>';
            
            var modalElement = $(modalHTML);
			
            var parent = canvas.parent();
            parent.append(modalHTML);
			
			canvas.siblings(".oscControllerModalDialog").on ("click", ".ok_button", { button_type: "ok" }, okHandler.bind(this));
			canvas.siblings(".oscControllerModalDialog").on ("click", ".canc_button", { button_type: "canc" }, okHandler.bind(this));
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
		
		var editString = "-edit";
		
		var nKNobs = 6;
		var nButtons = 12;
		var buttonsPerRow = 6;
		
		var knobImage = resources[0];
		var buttonImages = [resources[4], resources[5]];
		var buttonEditImages = [resources[1], resources[2]];
		var knobLeft = 18;
		var knobSpacing = 84;
		var buttonLeft = 18;
		var buttonSpacing = 84;
		var buttonTop = 140;
		var buttonYSpacing = 120;
		
		 var buttonEditArgs = {
	            ID: "",
	            left: 0,
	            top: 0,
	            mode: 'immediate',
	            imagesArray : buttonEditImages,
	            onValueSet: function (slot, value, element) {
					if (value === 1) {
						var id = element.split(editString)[0];
						this.createModalWindow(id);
					}
	            }.bind(this),
	            isListening: true
		 }
		
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
			 buttonEditArgs.ID = knobArgs.ID + editString;
			 buttonEditArgs.left = knobArgs.left + 25;
			 buttonEditArgs.top = knobArgs.top + knobArgs.tileHeight + 12;
			 this.ui.addElement(new K2.Button(buttonEditArgs));
			 var modelEntry = this.model[knobArgs.ID] = {};
			 modelEntry.description = "Knob " + (i + 1);
			 modelEntry.range = [0,1]; 
			 modelEntry.oscDest = null;
			 modelEntry.oscPath = '';
		 }
		 
		 var buttonArgs = {
             ID: "",
             left: 0,
             top: 0,
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
			 buttonEditArgs.ID = buttonArgs.ID + "-edit";
			 buttonEditArgs.left = buttonArgs.left + 28;
			 buttonEditArgs.top = buttonArgs.top + buttonArgs.imagesArray[0].height + 5;
			 this.ui.addElement(new K2.Button(buttonEditArgs));
			 var modelEntry = this.model[buttonArgs.ID] = {};
			 modelEntry.description = "Button " + (i + 1);
			 modelEntry.range = [0,1]; 
			 modelEntry.oscDest = null;
			 modelEntry.oscPath = '';
			 modelEntry.persistent = false;
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