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

(function($){

  $(function(){
    'use strict';

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
      $('a').removeClass('current-search');
    };

    // handle search terms arrays
    var clearSearchTerms = function(){
      currentSearch = clone(newSearch);
      newSearch.emotions = [{'label': 'all'}];
      newSearch.keywords = [];
    };

    var clearInfobox = function(){
      $('#research-emotions p').html('');
      $('#research-keywords p').html('');
    };

    var render = function(text, imgs){
      var html = '';
      for(var i = 0; i < imgs.length; i++){
        html += '<img src="' + imgs[i].entity + '" />';
      }
      for(var i = 0; i < text.length; i++){
        html += '<p>' + text[i].content + '</p>';
      }
      $('#data-frame').html(html);
    };
    
    var ajaxCall = function(textPath, imgsPath){
      $.ajax({
        url: settings.textEndpoint + textPath,
        success: function(textData, textStatus, jqXHR){
          $.ajax({
            url: settings.imgsEndpoint + imgsPath,
            success: function(imgsData, textStatus, jqXHR){
              render(textData.results, imgsData.results);
              
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
          var $p = $('#research-emotions p');
          appendNewSearchLabel(data, $p, 'clear');

        } else {
          var isAll = contains(newSearch.emotions, {'label': 'all'}, 'label');

          if(isAll) {
            // clear
            var $p = $('#research-' + type + ' p');
            appendNewSearchLabel(data, $p, 'clear');
          } else {
            // append
            var $p = $('#research-' + type + ' p');
            appendNewSearchLabel(data, $p, 'append');
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

    // setup
    $('a:not(#research-submit').on('click', function(e){ onClick(e, newSearch); });
    $('#research-submit').on('click', function(e){ update(e, newSearch); });

    newSearch.emotions.push({label: 'all'});
    newSearch.keywords.push({label:"lifeless", researchTwitter:"123", researchInsta:"153"});
    ajaxCall('researches=123', 'researches=153');
    setActive('all');
    setActive('lifeless');
  });
})(jQuery);