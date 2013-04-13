
/*
 * This is based off an example by Gauthier, but provides a restful backend in order to become a better
 * examples; as the benefits of Tomcat/Java EE 6
 */  
( function() { 
   	"use strict";
      
   	/* Everything into its own scope. */
   	var BookDatabase = {};
    window.BookDatabase = BookDatabase;

    BookDatabase.BookEntry = Backbone.Model.extend({
   	  defaults: {   		
   		title : "untitled",
   		isbn : "noisbn",
   		author : "no author"
   		/* If you give something a field called "id", this won't work! */
   	  },
   	  urlRoot:  "rest/books"
    });
    

    BookDatabase.Books = Backbone.Collection.extend({
    	model: BookDatabase.BookEntry,
    	url:  "rest/books"
    });

    /* This can be created without giving it a model, it is a 'top-level' view. */
    BookDatabase.Shelf = Backbone.View.extend({
        initialize: function() {
          this.template = Handlebars.loadTemplate('shelf');
          this.books = new BookDatabase.Books();
          this.books.on('all', this.render, this);
          this.books.fetch();         
        },
        render: function() {                  
          this.$el.html(this.template(this));
          this.books.each(this.addBook, this);
          var form = new BookDatabase.Shelf.Form({collection: this.books});
          this.$el.append(form.render().el);
          return this;
        },
        addBook: function(book) {   	
          var view = new BookDatabase.Shelf.Book({model: book});
          this.$('.books').append(view.render().el);
        },
        count: function() {
          return this.books.length;
        }
      });
    
    BookDatabase.Shelf.Book = Backbone.View.extend({        
        initialize: function() {
        	this.template = Handlebars.loadTemplate('book');
        },
        events: {
          'click button': 'deleteModel'
        },
        render: function() {
          this.$el.html(this.template(this));
          return this;
        },
        deleteModel: function() {
          this.model.destroy();
        }
      });

    BookDatabase.Shelf.Form = Backbone.View.extend({
        tagName: 'form',
        className: 'form-horizontal',
        initialize : function() {
        	this.template = Handlebars.loadTemplate('form');
        },
        events: {
          'submit': 'add'
        },
        render: function() {
          this.$el.html(this.template(this));
          return this;
        },
        add: function(event) {
          event.preventDefault();
          this.collection.create({
            title: this.$('#title').val(),
            author: this.$('#author').val(),
            isbn: this.$('#isbn').val()
          });
          this.render();
        }
      });

  })();