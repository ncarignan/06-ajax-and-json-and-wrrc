'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// The function references "this"
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // it is if else notation. If this.publishedOn exists, it returns what is after the ?. if false, it returns '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// Whenever the page is first loaded and whenever a new article is created. The raw data is JSON from localStorage.
Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  $.get('/data/hackerIpsum.json', function(data, message, xhr){
    let eTag = xhr.getResponseHeader('ETag');

    // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
    if (localStorage.eTag === eTag) {
      // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).
      //DONE: This function takes in an argument. What do we pass in to loadAll()?
      Article.loadAll(JSON.parse(localStorage.rawData));

      //DONE: What method do we call to render the index page?
      articleView.initIndexPage();
      // COMMENT: How is this different from the way we rendered the index page previously? What the benefits of calling the method here?
      // We are now putting a middle man in that checks for localStorage first and then initializing the page.

    } else {
      // DONE: When we don't already have the rawData:
      // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
      // - we need to cache it in localStorage so we can skip the server call next time
      // - we then need to load all the data into Article.all with the .loadAll function above
      // - then we can render the index page
      localStorage.setItem('eTag', eTag);
      localStorage.setItem('rawData', JSON.stringify(data));
      Article.loadAll(data);
      articleView.initIndexPage();

    // COMMENT: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // Before we can do anything, we need to grab it with AJAX jQuery get method. LoadAll needs to happen before initIndexPage because we need to recreate all objects with our constructor before writing to the page. Saving to localStorage can happen before or after, but we decided to save it first.
    }
  })
}
