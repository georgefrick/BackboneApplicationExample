(function () {
    "use strict";

    // Add a way to create unique id's.
    if (Math && !Math.s4 && !Math.guid) {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        Math.s4 = s4;
        Math.guid = function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
    }

    // Extend Handlebars to load [and cache] a template from within the DOM.
    if (Handlebars && !Handlebars.loadTemplate) {
        var loadTemplate = function (name) {
            if (this[name]) {
                return this[name];
            }
            var temp = $("#" + name + "-template").html();
            var compiled = Handlebars.compile(temp);
            this[name] = compiled;
            return compiled;
        };
        Handlebars.loadTemplate = loadTemplate;
    }

    /* Everything into its own scope. */
    var Application = {};
    window.Application = Application;

    /*
     * This is the root of the application, by linking things with href="#myurl", that link will run code.
     * Here, we manage the tabs within the application using those url/code matches. It works similar to Struts.
     */
    Application.Router = Backbone.Router.extend({
        initialize:function (options) {
            this.el = options.el;
            this.tabTemplate = Handlebars.loadTemplate("tab");
            this.tabContentTemplate = Handlebars.loadTemplate("tabContent");            
        },
        routes:{
            "":"showHome",
            "newBookList":"newBookList",
            "newTodoList":"newTodoList",
            "newCalculator":"newCalculator",
            "closeAll":"closeAllTabs"
        },
        showHome:function () {
            // do nothing.
        },
        newTodoList:function () {
            Backbone.history.navigate("#");
        },
        newCalculator:function () {
            // For the calculator, we allow multiple tabs...
        	 var tabId = "calculator-" + Math.guid();
             var tabName = "Calculator";
             var calc = new Calculator.CalculatorView();
             var uniqueId = this.addTab({
                 'id' : tabId,
                 'name' : tabName
             });
             var tabContent = $("#" + uniqueId);
             tabContent.empty();
             tabContent.append(calc.render().el);                       
            Backbone.history.navigate("#");
        },
        newBookList:function () {
            if (!this.openBookShelf || ($("#" + this.openBookShelf).length == 0)) {
                var tabId = "book-shelf" + Math.guid();
                var tabName = "Book Shelf";
                var shelf = new BookDatabase.Shelf();
                this.openBookShelf = this.addTab({
                    'id' : tabId,
                    'name' : tabName
                });
                var tabContent = $("#" + this.openBookShelf);
                tabContent.empty();
                tabContent.append(shelf.render().el);
            } else if (this.openBookShelf) {
                this.selectTabById(this.openBookShelf);
            }
            Backbone.history.navigate(""); // for now.
        },
        addTab : function(tabInfo) {
            var current = {
                // Defaults
                'name' : "New Tab",
                'content' : "",
                'show' : true,
                'id' : Math.guid()
            };
            var attr, val;
            var attrs = {};

            // Check if just the name was passed in, or an object full of properties.
            if (typeof tabInfo === 'object') {
                attrs = tabInfo;
            } else {
                attrs.name = tabInfo;
            }

            // Look for passed in options that override defaults and set them.
            for (attr in attrs) {
                val = attrs[attr];
                if (current[attr] !== undefined && !_.isEqual(current[attr], val)) {
                    current[attr] = val;
                }
            }

            // Construct the new tab, consisting of the tab and the tab content.
            this.el.find(".ui-tabs-nav:first").append(this.tabTemplate(current));
            this.el.append(this.tabContentTemplate(current));
            this.el.tabs("refresh");

            // If the user opted not to show the tab, it is opened in the background.
            if (current.show) {
                this.selectTabById(current.id);
            }
            return current.id;
        },
        selectTabById : function(tabId) {
            var index = $('#tabs a[href="' + tabId + '"]').parent().index();
            return $("#" + tabId).length && $("#tabs").tabs( "option", "active",index);
        },
        closeAllTabs:function () {
            var tabCount = $('#tabs >ul >li').size();
            while (tabCount > 1) {
                var tab = $( "#tabs" ).find( ".ui-tabs-nav li:eq(1)" ).remove();
                var panelId = tab.attr( "aria-controls" );
                $( "#" + panelId ).remove();
                $( "tabs" ).tabs( "refresh" );
                tabCount--;
            }
            Backbone.history.navigate(""); // for now.
        }
    });

    Application.startup = function (container) {
        container = $(container);
        var router = new Application.Router({el:container});
        Backbone.history.start();
        return router;
    };

})
    ();