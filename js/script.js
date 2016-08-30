(function($){

  $(function(){
    'use strict';

    // manipulation utilities: not extending obj and array
    // still shaky

    // clone object: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
    var clone = function(obj) {
      if (null == obj || "object" != typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
    }

    // check if array contains element by key
    var contains = function(arr, needle, key) {
      for(var i = 0; i < arr.length; i++){
        if(arr[i][key] == needle[key]) return true;
      }
      return false;
    };

    // remove element from array by key
    var removeFromArray = function(arr, el, key){
      for(var i = 0; i < arr.length; i++){
        if(arr[i][key] == el[key]) {
          arr.splice(i, 1);
          break;
        }
      }
    };

    // shuffle array: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    var shuffle = function(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    };

    // produce an array of indexes between min and max
    var indexArr = function(min, max) {
      var arr = [];
      for(var i = min; i < max; i++) {
        arr.push(i);
      }
      return arr;
    };
    
    // get item from array of obj by matching key
    var getListItem = function(match, arr, key){
      return arr.find(function(el){
        return el[key] == match;
      });
    };

    // get a random integer within a range
    // http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
    var getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };






    /**************************************/
    /**************************************/
    /*             SETUP PARAMS           */
    /**************************************/
    /**************************************/
    // terms: filters
    var emotions = [{
      label: "all",
      comfort: "null",
      energy: "null"
    },{
      label: "surprise",
      comfort: "-6",
      energy: "221"
    },{
      label: "happiness",
      comfort: "205",
      energy: "82"
    },{
      label: "pleasure",
      comfort: "186",
      energy: "2"
    },{
      label: "relax",
      comfort: "98",
      energy: "-136"
    },{
      label: "sadness",
      comfort: "-210",
      energy: "-86"
    },{
      label: "anger",
      comfort: "-201",
      energy: "100"
    },{
      label: "fear",
      comfort: "-165",
      energy: "150"
    },{
      label: "agitation",
      comfort: "-88",
      energy: "139"
    },{
      label: "pain",
      comfort: "-37",
      energy: "96"
    }];

    // terms: additive keywords
    var inhabit = [{
      label: "inhabit",
      researchTwitter: "", 
      researchInsta: ""
    },{ 
      label: "locate",
      researchTwitter: "102", 
      researchInsta: "134"
    },{
      label: "occupy",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "populate",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "possess",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "reside",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "abide",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "lodge",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "dwell",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "settle",
      researchTwitter: "", 
      researchInsta: ""
    },{
      label: "stay",
      researchTwitter: "", 
      researchInsta: ""
    }];

    // terms: additive keywords
    var uninhabit = [{
      label: "uninhabit",
      researchTwitter: "",
      researchInsta: ""
      },{
      label: "deserted",
      researchTwitter: "",
      researchInsta: "144"
      },{
      label: "desolate",
      researchTwitter: "",
      researchInsta: "145"
      },{
      label: "vacant",
      researchTwitter: "",
      researchInsta: "146"
      },{
      label: "abandoned",
      researchTwitter: "",
      researchInsta: ""
      },{
      label: "unoccupied",
      researchTwitter: "",
      researchInsta: "147"
      },{
      label: "empty",
      researchTwitter: "",
      researchInsta: "149"
      },{
      label: "forsaken",
      researchTwitter: "",
      researchInsta: "150"
      },{
      label: "leave",
      researchTwitter: "",
      researchInsta: "151"
      },{
      label: "free",
      researchTwitter: "",
      researchInsta: "152"
      },{
      label: "lifeless",
      researchTwitter: "123",
      researchInsta: "153"
    }];

    // API endpoints settings
    var settings = {
      textEndpoint: 'http://164.132.225.138/~caketest/testcake/api/getContentByComfortEnergy?',
      imgsEndpoint: 'http://164.132.225.138/~caketest/testcake/api/getImagesByComfortEnergy?'
    };

    // first search setup
    var lifeless = getListItem('lifeless', uninhabit, 'label'); 
    
    // currently only accepts one keyword and "all" emotions
    var firstSearch = {
      keywords: lifeless
    };

    // the elements of the search on display
    var currentSearch = {
      emotions: [],
      keywords: []
    };

    // the elements of the new planned search 
    // stored before "launch" is hit
    var newSearch = {
      emotions: [],
      keywords: []
    };

    // utility to sync with the css
    // DO NOT TOUCH
    var vizSettings = {
      rows: 8,
      cols: 4
    }; 

    // stores the current situation
    var currentItems = {
      text: [],
      imgs: [],
      textLeft: [],
      imgsLeft: []
    };

    // relevant timers
    var standByTimer;
    var standByStartUpTime = 60000;

    var newItemUpdateTime = 1000;
    var realTimeUpdateLimit = 5;


    // cache key jquery selections
    var $window = $(window);
    var $emotions = $('.emotions');
    var $inhabit = $('#left').find('.keywords');
    var $uninhabit = $('#right').find('.keywords');
    var $dataFrame = $('#data-frame');


    // startup html setup
    // more verbose than needed, but might change
    var appendEmotions = (function(emotions){
      $emotions.append(emotions.reduce(function(prev,el){
          return prev += '<li><a href="#" data-label="'+ el.label + '" data-comfort="' + el.comfort + '" data-energy="'+ el.energy + '">' + el.label + '</a></li>';
        }, ''));
    })(emotions);

    var appendInhabit = (function(){
      $inhabit.append(inhabit.reduce(function(prev,el){
          return prev += '<li><a href="#" data-label="'+ el.label + '" data-research-twitter="' + el.researchTwitter + '" data-research-insta="'+ el.researchInsta + '">' + el.label + '</a></li>';
        }, ''));
    })(inhabit);

    var appendUninhabit = (function(){
      $uninhabit.append(uninhabit.reduce(function(prev,el){
          return prev += '<li><a href="#" data-label="'+ el.label + '" data-research-twitter="' + el.researchTwitter + '" data-research-insta="'+ el.researchInsta + '">' + el.label + '</a></li>';
        }, ''));
    })(uninhabit);

    // cache the rest
    var $researchEmotions = $('#research-emotions');
    var $researchKeywords = $('#research-keywords');
    var $researchSubmit = $('#research-submit');
    var $researchSubmitWrapper = $('#research-submit-wrapper');
    var $newSearchToggle = $('#new-search-toggle');
    var $labels = $('a:not(#research-submit');
    var $allLinks = $('a');
    var $infoboxEmotions = $('#research-emotions p');
    var $infoboxKeywords = $('#research-keywords p');
    var $viz = $('#viz');
    var $intro = $('#intro');
      
    




    /**************************************/
    /**************************************/
    /*             UI UTILITIES           */
    /**************************************/
    /**************************************/
    // handle label of the UI
    var setActive = function(label){
      $('a[data-label="'+ label + '"]').addClass('current-search');
    };

    // handle all labels of the UI
    var setActiveMultiple = function(arr, key){
      for(var i = 0; i < arr.length; i++){
        setActive(arr[i][key]);
      }
    }
    // clean up all highlights from the labels in the UI
    var clearActive = function(){
      $allLinks.removeClass('current-search');
    };

    // handle search terms arrays
    var clearSearchTerms = function(){
      currentSearch = clone(newSearch);
      newSearch.emotions = [{'label': 'all'}];
      newSearch.keywords = [];
    };

    // clean content of the infobox for the new search
    var clearInfobox = function(){
      $infoboxEmotions.html('');
      $infoboxKeywords.html('');
    };



    /**************************************/
    /**************************************/
    /*           FETCH & UPDATE           */
    /**************************************/
    /**************************************/

    // setup render routine for new contents 
    // in the data frame at the center
    var renderSetup = function(text, imgs, settings){

      // get total number of items to display in grid
      var totItems = settings.rows*settings.cols;

      // setup counters to avoid overappending
      var textToDisplay = 0, imgsToDisplay = 0;

      // if both arrays are big, get half imgs, half text
      if(text.length > totItems/2 && imgs.length > totItems/2) {
        textToDisplay = totItems/2;
        imgsToDisplay = totItems/2;
      } else 

      // else find how to compensate between the biggest 
      // and smallest array, to avoid outOfBounds e
      if(text.length < totItems/2 && imgs.length > totItems/2) {
        textToDisplay = text.length;  
        imgsToDisplay = 
          imgsToDisplay >= totItems - text.length ?
            totItems - text.length : imgs.length > totItems ?
              totItems : imgs.length;
      } else 
      if(imgs.length < totItems/2 && text.length > totItems/2) {
        textToDisplay =   
          textToDisplay >= totItems - imgs.length ?
            totItems - imgs.length : text.length > totItems ?
              totItems: text.length;
        imgsToDisplay = imgs.length;
      } else 
      if(imgs.length < totItems/2 && text.length < totItems/2) {
        textToDisplay = text.length;
        imgsToDisplay = imgs.length;
      }

      // update cached selection
      currentItems.text = clone(text);
      currentItems.imgs = clone(imgs);
      currentItems.textLeft = shuffle(indexArr(0, text.length));
      currentItems.imgsLeft = shuffle(indexArr(0, imgs.length))
      
      // start append routine
      appendSetup(textToDisplay, imgsToDisplay, currentItems);
    };


    var getNewEl = function(currentItems, type){
      if(type == 'img') {
        var img = currentItems.imgs[currentItems.imgsLeft.shift()];
        return '<div style="background-image:url(' + img.entity + ');" /></div>';
      } else 
      if(type == 'text') {
        var text = currentItems.text[currentItems.textLeft.shift()];
        return '<p>' + text.content + '</p>';
      }
      return html;
    };

    var appendSetup = function(textToDisplay, imgsToDisplay, currentItems) {
      var html = '';

      // get total count of items to display
      var totItems = textToDisplay + imgsToDisplay;
      // setup counters again
      var textCounter = 0, imgsCounter = 0;

      // while you've not reached full capacity
      while(imgsCounter < imgsToDisplay || textCounter < textToDisplay) {
        
        // get randomly if text or image
        if( getRandomInt(0,1) == 0 ){
          if(imgsCounter < imgsToDisplay) {
            html += getNewEl(currentItems, 'img');
            imgsCounter++;
          }
        } else {
          if(textCounter < textToDisplay) {
            html += getNewEl(currentItems, 'text');
            textCounter++;
          }
        }  
      }

      // append all
      $dataFrame.html(html);

      
      // technical delay to wait append to finish
      // just for safety
      var appendTimer = setTimeout(function(){
        // clear timer
        clearTimeout(appendTimer);

        // get all elements in the central frame
        var $items = $dataFrame.find('*');

        // hide them all
        $items.addClass('hidden');

        // shuffle array of indexes to generate
        // a random fadein pattern
        var fadeInPattern = shuffle(indexArr(0, $items.length));
        
        // fade sequentially
        var fadeIn = setInterval(function(){
          
          $items.eq(fadeInPattern[0]).removeClass('hidden').addClass('visible');
          fadeInPattern.shift();
          
          // when done with the fading, setup up 
          // updating the frame with new elements
          // from the same selection
          if(fadeInPattern.length == 0) {
            
            clearInterval(fadeIn);
            var counter = 0;

            // start autoupdate
            /*var autoUpdate = setInterval(function(){
              counter = renderNewEl(autoUpdate, currentItems, counter);
            }, newItemUpdateTime);*/
          }
        
        }, 200); // between elements delay
      
      }, 20); // technical delay
      
    };

    // render single item in the central frame
    var renderNewEl = function(timer, currentItems, counter) {
      
      // store selection
      var $items = $dataFrame.find('*');

      // get random index from selection
      var index = getRandomInt(0, $items.length);

      // define item that will be replaced
      var $itemToChange = $items.eq(index);

      // get new element (whether img or text)
      var newEl = false;
      var html = '';
      while(!newEl) {
        if( getRandomInt(0,1) == 0 ){
          if(currentItems.imgsLeft.length > 0){
            html = getNewEl(currentItems, 'img');
            newEl = true;
          }
        } else {
          if(currentItems.textLeft.length > 0){
            html = getNewEl(currentItems, 'text');
            newEl = true;
          }
        }
      }

      // swap and animate out/in
      html = $(html);
      $itemToChange.addClass('hidden').removeClass('visible');
      setTimeout(function(){
        $itemToChange.replaceWith(html);
        $(html).addClass('hidden');
        setTimeout(function(){
          $(html).addClass('visible').removeClass('hidden');

          if(counter > realTimeUpdateLimit-1) {
            var textUrl = getQueryPath(currentSearch, 'text');
            var imgsUrl = getQueryPath(currentSearch, 'imgs');
            clearInterval(timer);
            ajaxCall(textUrl, imgsUrl, false);
          }

        }, 150);
      }, 250);
      counter++;

      // return counter to update with new real time data
      return counter;
    };
    
    // fetch from server: note that 2 calls are required
    // to fetch imgs from getImages and getText endpoints
    // aka callback hell
    var ajaxCall = function(textPath, imgsPath, clear){
      $.ajax({
        url: settings.textEndpoint + textPath,
        success: function(textData, textStatus, jqXHR){
          $.ajax({
            url: settings.imgsEndpoint + imgsPath,
            success: function(imgsData, textStatus, jqXHR){
              
              renderSetup(textData.results, imgsData.results, vizSettings);
              
              // if the search is effectively new
              // and not a real time autoupdate on 
              // the current search
              // clean up all references and setup
              // new basic search
              if(clear) {
                clearSearchTerms();
                
                clearInfobox();
                updateInfobox({'label': 'all'}, 'emotions', 'add');
                
                toggleNewSearch();

                // also update selected labels in the UI
                clearActive();
                setActiveMultiple(currentSearch.emotions, 'label');
                setActiveMultiple(currentSearch.keywords, 'label');
                
              }
            }
          });
        }
      });
    };

    // composes the query path according to the HE API
    var getQueryPath = function(params, type){
      var path = 'researches=';

      for(var i = 0; i < params.keywords.length; i++) {
        path += type == 'imgs' ? 
          params.keywords[i].researchTwitter :
          params.keywords[i].researchInsta;
        if(i < params.keywords.length-1) path +=',';
      }
      if(params.emotions[0].label != 'all') {
        path += '&comfort=';
        for(var i = 0; i < params.emotions.length; i++) {
          path += params.emotions[i].comfort;
          if(i < params.emotions.length-1) path +=',';
        }
        path += '&energy=';
        for(var i = 0; i < params.emotions.length; i++) {
          path += params.emotions[i].energy;
          if(i < params.emotions.length-1) path +=',';
        }
        path += '&delta=100';
      }
      return path;
    };

    // basic update routine:
    // build query path, do ajax call
    var update = function(e, newSearch){
      var textUrl = getQueryPath(newSearch, 'text');
      var imgsUrl = getQueryPath(newSearch, 'imgs');
      ajaxCall(textUrl, imgsUrl, true);
    };

    // utility to append data on the UI
    // gives feedback to the user on next planned search
    var appendNewSearchLabel = function(data, $el, type) {
      type == 'clear' ?
        $el.html('<span>' + data.label + '</span> '):
        $el.append('<span>' + data.label + '</span> ');
      setTimeout(function(){
        $el.find('span:last-child').addClass('visible');
      },150);
    };

    // update the information box on the bottom
    // according to the interaction with the UI
    var updateInfobox = function(data, type, action){
      if(action == 'add'){
        if(type == 'emotions' && data.label == 'all') {
          // all cleans all other emotions
          appendNewSearchLabel(data, $infoboxEmotions, 'clear');
        } else {
          var isAll = contains(newSearch.emotions, {'label': 'all'}, 'label');

          if(isAll) {
            // see above
            var $infobox = $('#research-' + type + ' p');
            appendNewSearchLabel(data, $infobox, 'clear');
          } else {
            // otherwise, list all emotion filters
            var $infobox = $('#research-' + type + ' p');
            appendNewSearchLabel(data, $infobox, 'append');
          }
        }
      } else {
        var $label = $('#research-' + type + ' p span:contains(' + data.label + ')');
        $label.removeClass('visible');
        setTimeout(function(){
          $label.remove();
        },500);
      }
    };

    // event handler: update UI and cached data
    // accordingly with the interactions
    var onClick = function(e, newSearch){
      e.preventDefault();

      var $target = $(e.currentTarget);
      var searchKey = $target.data();
      var isEmotion = $target.parents('ul').hasClass('emotions');
      var isKeyword = $target.parents('ul').hasClass('keywords');

      if(isEmotion) {
        // check if 'all' is in the emotions array
        var isAllInArray = contains(newSearch.emotions, {'label': 'all'}, 'label');
        // check if current data is already in array
        var isDataInArray = contains(newSearch.emotions, searchKey, 'label');

        // update feedback and cached info
        if(!isDataInArray){
          updateInfobox(searchKey, 'emotions', 'add');

          if(searchKey.label != 'all') {
            if(isAllInArray) {
              newSearch.emotions = [searchKey];
            } else {
              newSearch.emotions.push(searchKey);
            }
          } else {
            newSearch.emotions = [searchKey];
          }
          
        } else {
          updateInfobox(searchKey, 'emotions', 'remove');
          removeFromArray(newSearch.emotions, searchKey, 'label');
        }

      } else
      if(isKeyword) {
        var isDataInArray = contains(newSearch.keywords, searchKey, 'label');
        if(!isDataInArray){
          updateInfobox(searchKey, 'keywords', 'add');
          newSearch.keywords.push(searchKey);            
        } else {
          updateInfobox(searchKey, 'keywords', 'remove');
          removeFromArray(newSearch.keywords, searchKey);
        }
      }  
    };

    // stand by mode utilities
    var resetStandByTimer = function(){
      clearTimeout(standByTimer);
      standByTimer = setTimeout(function(){
        $viz.fadeOut();
        $intro.fadeIn();
        $window.on('mousemove', clearStandBy);
      }, standByStartUpTime);
    }

    var clearStandBy = function(e) {
      clearTimeout(standByTimer);
      $window.off('mousemove', clearStandBy);
      $window.off('mousemove', resetStandByTimer);      
      setTimeout(function(){
        $viz.fadeIn();
        $intro.fadeOut();
        resetStandByTimer();
        $window.on('mousemove', resetStandByTimer);
      }, 250);
    };

    

    // interactions
    var toggleNewSearch = function(e){
      $newSearchToggle.toggleClass('active');
      $researchEmotions.toggleClass('active');
      $researchKeywords.toggleClass('active');
      $researchSubmitWrapper.toggleClass('active');
    };

    // event listeners
    $labels.on('click', 
      function(e){ 
        if( $newSearchToggle.hasClass('active') ) {
          onClick(e, newSearch);
        } 
      });
    $researchSubmit.on('click', function(e){ update(e, newSearch); });

    // setup first UI feeback and research
    newSearch.emotions.push({label: 'all'});
    newSearch.keywords.push({label:"locate", researchTwitter:"102", researchInsta:"134"});
    
    // start first search
    ajaxCall('researches=134', 'researches=102', true);
    setActive('all');
    setActive('lifeless');

    // interactions
    $newSearchToggle.on('click', toggleNewSearch);

    $window.on('mousemove', clearStandBy);

  });
})(jQuery);