jquery-suggest
==============

A jQuery plugin for autosuggest dropdowns.

##Example
```
userSuggestTemplate = function(suggestion) {
  var html = '';
  html += '<li>';
  html += '<img class="img-thumbnail" src="' + suggestion.avatarUrl + '">';
  html += '<span class="name">' + suggestion.name + '</span>';
  html += '<span class="username">@' + suggestion.username + '</span>';
  html += '</li>';
  return html;
}
var suggestOptions = {
  indicator: '@',
  queryUrl: '/users',
  queryParams: {sort: true},
  maxNumberOfSuggestions: 6,
  template: userSuggestTemplate,
  suggestionKey: 'username',
}
$('p#editable-field').suggest(suggestOptions);
```
Template gets wrapped in a ``<ul>`` element, which is wrapped in a ``<div>`` with an id of `suggest` and a class of `suggestions`. So you can use that div to style the suggestions popup.

###Example styles:
```
.suggestions {
  position: absolute;
  background: #fff;
  z-index: 100;
  border-radius: 10px;
  -webkit-box-shadow: 0 0 3px rgba(0,0,0,0.3);
  margin-top: 5px;
}
```
###Options parameter

- ``indicator``: when this character is inputted into the textarea or editable content field, Suggest gets fired. required
- ``queryUrl``: the url used to retrieve an array of json objects. **required**
  - always included is the query paramater search[term] which is the term that the user has typed immediately following the indicator.
- ``queryParams``: optional params to be sent along with the queryUrl. **optional**
- ``maxNumberOfSuggestions``: **optional**; default is 100
- ``template``: html that will be injected into a ``<ul>`` element. Example above. **required**
- ``suggestionKey``: the attribute on the suggestion object that will be inserted immediately next to the indicator once an ``<li>`` item is selected. **required**
- ``minCharactersBeforeSuggestions``: minimum number of characters after the `indicator` required in order for suggestions to be shown. **optional**

Requires jQuery.

##Demo
http://jsfiddle.net/natearmstrong2/p2DWy/2/
