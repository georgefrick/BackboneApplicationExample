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

    // Add a loader to handlebars.
    if (Handlebars && !Handlebars.loadTemplate) {
        Handlebars.loadTemplate = function (name) {
            return Handlebars.compile($('#' + name + '-template').html());
        };
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
            this.calculatorIndex = 0;
        },
        routes:{
            "":"showHome",
            "newBookList":"newBookList",
            "newTodoList":"newTodoList",
            "newCalculator":"newCalculator",
            "closeAll":"closeAllTabs"
        },
        showHome:function () {
            // NO OP
        },
        newTodoList:function () {
            Backbone.history.navigate("#");
        },
        newCalculator:function () {
            // For the calculator, we allow multiple tabs...
            var index = "calculator" + this.calculatorIndex;
            var calc = new Calculator.CalculatorView();
            this.addTab("Calculator " + this.calculatorIndex, calc.render().el, index );
            this.calculatorIndex++;
            Backbone.history.navigate("#");
        },
        newBookList:function () {
            var shelf = new BookDatabase.Shelf();
            this.addTab("Bookshelf", shelf.render().el );
            Backbone.history.navigate("#");
        },
        addTab:function (name, content, idIn) {
            var id = Math.guid();
            if( idIn ) {
                id = idIn;
            }
            var newTab = {
                id:id,
                label: name
            };
            var li = this.tabTemplate(newTab);
            var fullContent = this.tabContentTemplate(newTab);
            fullContent = $(fullContent).append(content);

            this.el.find(".ui-tabs-nav").append(li);
            this.el.append(fullContent);
            this.el.tabs("refresh");
        }
    });

    Application.startup = function (container) {
        container = $(container);
        var router = new Application.Router({el:container});
        Backbone.history.start();
    };

})
    ();