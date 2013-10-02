/* ============================================================
* jquery.suggest.js v1.0
* http://www.custombit.com/
* https://github.com/custombit/jquery-suggest
* ============================================================
* Copyright 2013 Custom Bit, LLC.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ============================================================ */

!function($) {

  /* SUGGEST CLASS DEFINITION
   * ==================== */
  function Suggest(element, options) {

    element = $(element);
    this.$element = element;
    this.query = ''
    this.suggestions = [];
    this.options = options;
    this.mostRecentRequestAt = null;
    var $this = this;

    this.$element.on('keyup', function() {
      $this.suggestions = [];
      if ($this.$element.text().indexOf($this.options.indicator) > -1 || $this.$element.val().indexOf($this.options.indicator) > -1) {
        if ($this.isTextArea()) {
          $this.cursorPosition = $this.getTextareaCursor(element);
        } else {
          $this.cursorPosition = $this.getCursorPosition(element);
        }
        $this.getQuery($this.cursorPosition);
      }
    }).on('click', function() {
      if ($this.isTextArea()) {
        $this.cursorPosition = $this.getTextareaCursor(element);
      } else {
        $this.cursorPosition = $this.getCursorPosition(element);
      }
      $this.getQuery($this.cursorPosition);
    }).on('focusout', function() {
      setTimeout(function() {
        $('div#suggest').empty();
      }, 200);
    });

    this.getQuery = function(cursorPosition) {
      var text, space;
      if ($this.isTextArea()) {
        text = $this.$element.val();
      } else {
        if (window.getSelection()) {
          var sel = window.getSelection();
          text = sel.anchorNode.data;
        }
      }
      if (typeof text == 'undefined') { text = '' };
      text += ' ';
      space = text.lastIndexOf(' ', cursorPosition - 1);
      for (var i = cursorPosition; i >= 0; i--) {
        if (i == space) {
          $this.suggestions = [];
          $('div#suggest').empty();
          break;
        }
        if (text[i] == $this.options.indicator) {
          var query = text.slice(i + 1, text.indexOf(' ', i));
          $this.query = query;
          $this.showSuggestions();
          break;
        }
      }
    }

    this.showSuggestions = function() {
      $('div#suggest').remove();
      $this.$element.after('<div id="suggest" class="suggestions"></div>');
      $('div#suggest').width($this.$element.outerWidth());
      var params = { search: { suggest: true, term: $this.query }, queryParams: $this.options.queryParams };
      $this.mostRecentRequestAt = Date.now();
      var requestedAt = Date.now();
      $.ajax({
        url: $this.options.queryUrl,
        data: params,
        success: function(entries) {
          if ($this.mostRecentRequestAt != requestedAt) { return; }
          $this.mostRecentRequestAt = null;
          if ($this.options.queryCallback) {
            entries = $this.options.queryCallback(entries);
          }
          $.map(entries, function(entry) {
            $this.suggestions.push(entry);
          });
          if ($this.suggestions.length < 1) {
            $('div#suggest').empty();
            return;
          } else {
            $this.suggestions = $this.suggestions.slice(0, $this.options.maxNumberOfSuggestions || 100);
            $this.showPopup();
          }
        }
      });
    }

    this.showPopup = function() {
      var suggestion_list = '<ul>';
      var suggestions;
      for (i = 0; i < $this.suggestions.length; i++) {
        suggestion = $this.suggestions[i];
        suggestion_list += $this.options.template(suggestion);
      }
      suggestion_list += '</ul>';
      $('div#suggest').html((suggestion_list));
      $('.suggestions ul li').click(function() {
        var replacement = $this.options.indicator + $this.suggestions[$(this).index()][$this.options.suggestionKey] + '&nbsp;';
        var text;
        if ($this.isTextArea()) {
          text = $this.$element.val();
        } else {
          text = $this.$element.html();
        }
        text += ' ';
        newText = text.replace(new RegExp('\\' + $this.options.indicator + $this.query + '\\b'), replacement);
        if ($this.isTextArea()) {
          text = $this.$element.val(newText);
        } else {
          text = $this.$element.html(newText);
        }
        $this.moveCursorToEnd($this.$element);
        $('div#suggest').empty();
      });
    }

    this.getCursorPosition = function(editableDiv) {
      var caretPos = 0, containerEl = null, sel, range;
      if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          caretPos = range.endOffset;
        }
      } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() == editableDiv) {
          var tempEl = document.createElement("span");
          editableDiv.insertBefore(tempEl, editableDiv.firstChild);
          var tempRange = range.duplicate();
          tempRange.moveToElementText(tempEl);
          tempRange.setEndPoint("EndToEnd", range);
          caretPos = tempRange.text.length;
        }
      }
      return caretPos;
    }

    this.getTextareaCursor = function(el) {
      el = el[0];
      if (el.selectionStart) {
        return el.selectionStart;
      } else if (document.selection) {
        el.focus();

        var r = document.selection.createRange();
        if (r == null) {
          return 0;
        }

        var re = el.createTextRange(),
            rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
      }
      return 0;
    }

    this.moveCursorToEnd = function(element) {
      element.focus();
      // http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
      if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
        var range = document.createRange();
        range.setStart(element[0], 1);
        range.collapse(true);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange != 'undefined') {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(element[0]);
        textRange.collapse(false);
        textRange.select();
      }
    }

    this.isTextArea = function() {
      return $this.$element.is('textarea');
    }

  }

  $.fn.suggest = function (options) {
    return this.each(function() {
      new Suggest(this, options);
    });
  }

}(window.jQuery);
