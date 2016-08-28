var settings = {
  textEndpoint: 'http://164.132.225.138/~caketest/testcake/api/getContentByComfortEnergy?',
  imgsEndpoint: 'http://164.132.225.138/~caketest/testcake/api/getImagesByComfortEnergy?'
};
var currentSearch = {
  emotions: [],
  keywords: []
};
var newSearch = {
  emotions: [],
  keywords: []
};

var vizSettings = {
  rows: 4,
  cols: 2
};

(function($){

  $(function(){
    'use strict';

    // cache jquery sel
    var $window = $(window);
    var $dataFrame = $('#data-frame');
    var $researchEmotions = $('#research-emotions');
    var $researchKeywords = $('#research-keywords');
    var $researchSubmit = $('#research-submit');
    var $researchSubmitWrapper = $('#research-submit-wrapper');
    var $newSearchToggle = $('#new-search-toggle');
    var $labels = $('a:not(#research-submit');
    var $allLinks = $('a');
    var $infoboxEmotions = $('#research-emotions p');
    var $infoboxKeywords = $('#research-keywords p');
      

    // get stylesheet for css injection
    var stylesheet = (function(){
      var styles = document.styleSheets;
      for(var i = 0; i < styles.length; i++) {
        if(styles[i].href.indexOf('style.css') > -1) return styles[i];
      }
    })();

    

    var injectCss = (function(e){
      $window.off('resize', injectCss);
      setTimeout(function(){
        // remember to change accordingly in css under #data-frame p
        var margin = 7*2;
        var dim = (($dataFrame.width() / vizSettings.rows) - margin).toString();
        var styles = 'width: ' + dim + 'px; height: ' + dim + 'px;';
        stylesheet.addRule('#data-frame p', styles);
        $window.on('resize', injectCss);
      }, 2000);
    })();

    $window.on('resize', injectCss);
    

    // UTILITIES
    // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
    var clone = function(obj) {
      if (null == obj || "object" != typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
    }
    // check if array contains element
    var contains = function(arr, needle, key) {
      for(var i = 0; i < arr.length; i++){
        if(arr[i][key] == needle[key]) return true;
      }
      return false;
    };
    // remove element from array
    var removeFromArray = function(arr, el, key){
      for(var i = 0; i < arr.length; i++){
        if(arr[i][key] == el[key]) {
          arr.splice(i, 1);
          break;
        }
      }
    };

    // handle labels of the UI
    var setActive = function(label){
      $('a[data-label="'+ label + '"]').addClass('current-search');
    };

    var setActiveMultiple = function(arr, key){
      for(var i = 0; i < arr.length; i++){
        setActive(arr[i][key]);
      }
    }

    var clearActive = function(){
      $allLinks.removeClass('current-search');
    };

    // handle search terms arrays
    var clearSearchTerms = function(){
      currentSearch = clone(newSearch);
      newSearch.emotions = [{'label': 'all'}];
      newSearch.keywords = [];
    };

    var clearInfobox = function(){
      $infoboxEmotions.html('');
      $infoboxKeywords.html('');
    };

    var render = function(text, imgs, settings){
      var html = '';
      var totItems = settings.rows*settings.cols;
      var textToDisplay = 0, imgsToDisplay = 0;
      if(text.length > totItems/2 && imgs.length > totItems/2) {
        textToDisplay = totItems/2;
        imgsToDisplay = totItems/2;
      } else 
      if(text.length < totItems/2 && imgs.length > totItems/2) {
        textToDisplay = text.length;  
        imgsToDisplay = 
          imgsToDisplay >= totItems - text.length ?
            totItems - text.length : imgs.length;
      } else 
      if(imgs.length < totItems/2 && text.length > totItems/2) {
        textToDisplay =   
          textToDisplay >= totItems - imgs.length ?
            totItems - imgs.length : text.length;
        imgsToDisplay = imgs.length;
      } else 
      if(imgs.length < totItems/2 && text.length < totItems/2) {
        textToDisplay = text.length;
        imgsToDisplay = imgs.length;
      }
      // build html
      for(var i = 0; i < imgsToDisplay; i++){
        html += '<img src="' + imgs[i].entity + '" />';
      }
      for(var i = 0; i < textToDisplay; i++){
        html += '<p>' + text[i].content + '</p>';
      }
      // display
      $dataFrame.html(html);
    };
    
    var ajaxCall = function(textPath, imgsPath){
      $.ajax({
        url: settings.textEndpoint + textPath,
        success: function(textData, textStatus, jqXHR){
          $.ajax({
            url: settings.imgsEndpoint + imgsPath,
            success: function(imgsData, textStatus, jqXHR){
              render(textData.results, imgsData.results, vizSettings);
              
              clearSearchTerms();
              clearInfobox();
              updateInfobox({'label': 'all'}, 'emotions', 'add');

              // update selected labels in the UI
              clearActive();
              setActiveMultiple(currentSearch.emotions, 'label');
              setActiveMultiple(currentSearch.keywords, 'label');
            }
          });
        }
      });
    };

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

    var update = function(e, newSearch){
      var textUrl = getQueryPath(newSearch, 'text');
      var imgsUrl = getQueryPath(newSearch, 'imgs');
      ajaxCall(textUrl, imgsUrl);
    };

    var appendNewSearchLabel = function(data, $el, type) {
      type == 'clear' ?
        $el.html('<span>' + data.label + '</span>'):
        $el.append('<span>' + data.label + '</span> ');
      setTimeout(function(){
        $el.find('span:last-child').addClass('visible');
      },150);
    };

    // update the information box on the bottom
    var updateInfobox = function(data, type, action){
      if(action == 'add'){

        if(type == 'emotions' && data.label == 'all') {
          // clean
          appendNewSearchLabel(data, $infoboxEmotions, 'clear');

        } else {
          var isAll = contains(newSearch.emotions, {'label': 'all'}, 'label');

          if(isAll) {
            // clear
            var $infobox = $('#research-' + type + ' p');
            appendNewSearchLabel(data, $infobox, 'clear');
          } else {
            // append
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

    

    // interactions
    var toggleNewSearch = function(e){
      $(e.currentTarget).toggleClass('active');
      $researchEmotions.toggleClass('active');
      $researchKeywords.toggleClass('active');
      $researchSubmitWrapper.toggleClass('active');
    };

    // setup
    // dims
    //vizSettings


    // event listeners
    $labels.on('click', 
      function(e){ 
        if( $newSearchToggle.hasClass('active') ) {
          onClick(e, newSearch);
        } 
      });
    $researchSubmit.on('click', function(e){ update(e, newSearch); });

    newSearch.emotions.push({label: 'all'});
    newSearch.keywords.push({label:"lifeless", researchTwitter:"123", researchInsta:"153"});
    ajaxCall('researches=123', 'researches=153');
    setActive('all');
    setActive('lifeless');

    // interactions
    $newSearchToggle.on('click', toggleNewSearch);
  });
})(jQuery);