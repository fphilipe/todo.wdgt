var PreferenceStore = new (function() {
  var self = this;

  this.URLs = {
    details: "http://todo.philipefatio.com/releasenotes.html",
    download: "http://todo.philipefatio.com/download/To Do.zip",
    version: "http://todo.philipefatio.com/download/version.php",
    donate: "https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=todo%40philipefatio%2ecom&item_name=To%20Do%20Widget&no_shipping=1&cn=Optional%20Note&tax=0&currency_code=EUR&lc=US&bn=PP%2dDonationsBF&charset=UTF%2d8",
    help: "Guide.pdf"
  }

  var initialize = function() {
    if(!Display.list)
      Display.list = document.getElementById("list");
    for(var key in preferences)
      preferences[key].initialize();
  }

  /*
  Gets the value for the preference in the argument. If none is found, returns preference from disk.
  */
  this.preferenceForKey = function(key) {
    var ret = undefined;
    if(!preferences[key] || (ret = preferences[key].value) === undefined) {
      ret = widget.preferenceForKey(widget.identifier+"-"+key) || widget.preferenceForKey(key);
    }
    return ret;
  }

  // remove instance preferences when the widget is removed
  widget.onremove = function() {
    for(var key in preferences)
      widget.setPreferenceForKey(null, widget.identifier+"-"+key);
    widget.setPreferenceForKey(null, widget.identifier+"-lastWidth");
    widget.setPreferenceForKey(null, widget.identifier+"-lastHeight");
  }

  // writes an instance preference to disk
  this.setInstancePreferenceForKey = function(value, key) {
    if(value === undefined) return;
    widget.setPreferenceForKey(value, widget.identifier+"-"+key);
  }

  // writes an instance and global preference to disk
  this.setPreferenceForKey = function(value, key) {
    this.setInstancePreferenceForKey(value, key);
    widget.setPreferenceForKey(value, key);
  }

/*========== Individual preferences ==========*/
/*
  Each object stands for one preference.
*/
  var preferences = {
// single line preference:
//    defines if each task is displayed on a single line
//    or, if needed, on multiple lines.
    singleLine: {
      initialize: function() {
        this.element = document.getElementById("singleLinePreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("singleLine");
        this.element.checked = this.value = (this.value == undefined) ? true : this.value;
        Display.list.setAttribute("singleline", this.value+"");
      },
      toggle: function() {
        Display.list.setAttribute("singleline", (this.value = this.element.checked)+"");
        HTMLBridge.displayTasks();
        PreferenceStore.setPreferenceForKey(this.value, "singleLine");
      }
    },
// strike through preference:
//    defines if each completed task is striked through.
    strikeThrough: {
      initialize: function() {
        this.element = document.getElementById("strikeThroughPreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("strikeThrough");
        this.element.checked = this.value = (this.value == undefined) ? true : this.value;
        Display.list.setAttribute("strikethrough", this.value+"");
      },
      toggle: function() {
        Display.list.setAttribute("strikethrough", (this.value = this.element.checked)+"");
        PreferenceStore.setPreferenceForKey(this.value, "strikeThrough");
      }
    },
// show calendar color preference:
//    defines if calendar color is shown in checkboxes.
    showCalendarColor: {
      initialize: function() {
        this.element = document.getElementById("showCalendarColorPreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("showCalendarColor");
        this.element.checked = this.value = (this.value == undefined) ? true : this.value;
      },
      toggle: function() {
        PreferenceStore.setPreferenceForKey((this.value = this.element.checked), "showCalendarColor");
        HTMLBridge.displayTasks();
      }
    },
// auto adjust height preference:
//    defines if the widget is automatically adjusted to fit content.
    autoAdjustHeight: {
      initialize: function() {
        this.element = document.getElementById("autoAdjustHeightPreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("autoAdjustHeight");
        this.element.checked = this.value = (this.value == undefined) ? false : this.value;
      },
      toggle: function() {
        PreferenceStore.setPreferenceForKey((this.value = this.element.checked), "autoAdjustHeight");
        if(this.value == true) {
          var i = -1, h = 0;
          while(++i < Display.list.childNodes.length) {
            h+= parseFloat(document.defaultView.getComputedStyle(Display.list.childNodes[i], '').getPropertyValue("height"));
            if(h >= Display.widgetMaxSize.h-67) break;
          }
          h+=67;
          h = (h > Display.widgetMaxSize.h) ? Display.widgetMaxSize.h : ((h < Display.widgetMinSize.h) ? Display.widgetMinSize.h : h);
          Display.widgetSize.h = h;
        } else {
          Display.widgetSize.h = PreferenceStore.preferenceForKey("lastHeight");
        }
      }
    },
  // show priority preference:
  //    defines if the priority of each task is displayed
  //    on the front.
    showPriority: {
      initialize: function() {
        this.element = document.getElementById("showPriorityPreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("showPriority");
        this.element.checked = this.value = (this.value == undefined) ? true : this.value;
        Display.list.setAttribute("showpriority", this.value+"");
      },
      toggle: function() {
        Display.list.setAttribute("showpriority", (this.value = this.element.checked)+"");
        PreferenceStore.setPreferenceForKey(this.value, "showPriority");
      }
    },
  // show due date preference:
  //    defines if the due date is displayed
  //    on the front.
    showDueDate: {
      initialize: function() {
        this.element = document.getElementById("showDueDatePreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("showDueDate");
        this.element.checked = this.value = (this.value == undefined) ? false : this.value;
      },
      toggle: function() {
        PreferenceStore.setPreferenceForKey((this.value = this.element.checked), "showDueDate");
        HTMLBridge.displayTasks();
      }
    },
  // show completed tasks preference:
  //    defines if completed tasks are displayed
  //    (default: true)
    showCompletedTasks: {
      initialize: function() {
        this.element = document.getElementById("showCompletedTasksPreference");
        this.secondElement = document.getElementById("limitCompletedTasksPreference");
        this.thirdElement = document.getElementById("completedTasksLimitationPreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("showCompletedTasks");
        this.element.checked = this.value = (this.value == undefined) ? true : this.value;

        if(this.value == false) {
          this.secondElement.disabled = this.thirdElement.disabled = true;
        }
      },
      toggle: function() {
        PreferenceStore.setPreferenceForKey((this.value = this.element.checked), "showCompletedTasks");
        if(this.value == false) {
          this.secondElement.disabled = this.thirdElement.disabled = true;
        } else {
          this.secondElement.disabled = false;
          if(this.secondElement.checked == true) {
            this.thirdElement.disabled = false;
          }
        }
        HTMLBridge.displayTasks();
      }
    },
  // limit completed tasks preference:
  //    defines if the completed tasks
  //    are limited. (default: false)
    limitCompletedTasks: {
      initialize: function() {
        this.element = document.getElementById("limitCompletedTasksPreference");
        this.secondElement = document.getElementById("completedTasksLimitationPreference");
        var self = this;
        this.element.addEventListener("change", function() { self.toggle.apply(self); }, false);
        this.value = PreferenceStore.preferenceForKey("limitCompletedTasks");
        this.element.checked = this.value = (this.value == undefined) ? false : this.value;
        this.secondElement.disabled = !this.value;
      },
      toggle: function() {
        PreferenceStore.setPreferenceForKey((this.value = this.element.checked), "limitCompletedTasks");
        this.secondElement.disabled = !this.value;
        HTMLBridge.displayTasks();
      }
    },
  // completed tasks limitation preference:
  //    defines if the completed tasks
  //    are limited. (default: false)
    completedTasksLimitation: {
      initialize: function() {
        this.element = document.getElementById("completedTasksLimitationPreference");
        var self = this;
        this.element.addEventListener(
          "keydown",
          function(event) {
            // when we press enter, save it:
            if(event.keyCode == 13)
              self.element.blur();
            else
              self.checkIfIsNumber.apply(self, arguments);
          }, false
        );
        this.element.addEventListener("blur", function() { self.change.apply(self); }, false);
        this.element.value = this.value = PreferenceStore.preferenceForKey("completedTasksLimitation") || 7;
      },
      checkIfIsNumber: function(event) {
        var allowedKeys = [
          37, // left key
          39, // right key
          8, // backspace
          46, // delete
          48, // 0
          49, // 1
          50, // 2
          51, // 3
          52, // 4
          53, // 5
          54, // 6
          55, // 7
          56, // 8
          57, // 9
          96,  // 0 keypad
          97,  // 1 keypad
          98,  // 2 keypad
          99,  // 3 keypad
          100, // 4 keypad
          101, // 5 keypad
          102, // 6 keypad
          103, // 7 keypad
          104, // 8 keypad
          105, // 9 keypad
        ];
        if(allowedKeys.indexOf(event.keyCode) < 0 ||
           event.shiftKey == true ||
           event.altGraphKey == true ||
           event.altKey == true ||
           event.ctrlKey == true ||
           event.metaKey == true) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
      change: function() {
        if(isNaN(parseInt(this.element.value)) || this.element.value == "0")
          this.element.value = this.value;
        PreferenceStore.setPreferenceForKey((this.element.value = this.value = parseInt(this.element.value)), "completedTasksLimitation");
        HTMLBridge.displayTasks();
      }
    },
  // selected calendar preference:
  //    defines the calendar to show the to do's from.
  //    default is all calendars (=null)
    selectedCalendar: {
      initialize: function() {
        this.element = document.getElementById("calendar").firstChild;
        this.value = PreferenceStore.preferenceForKey("selectedCalendar") || "all";

        var self = this;
        this.element.addEventListener("change", function() { self.change.apply(self); }, false);

        this.buildSelect();
        CalendarStore.observe(this, this.calendarsChanged);
      },
      change: function() {
        if(this.element.value == "new") {
          this.element.blur();
          var self = this;
          this.element.value = this.value;
          var handler = function(newUID) {
            if(newUID && newUID != false) {
              self.element.focus();
              self.element.value = newUID;
              self.element.blur();
            }
          }
          HUD.showNewCalendarPrompt(function() { handler.apply(self, arguments); });
        } else {
          /* 3 different scenarios:
           *   1. switching from all to one calendar: fade out tasks not belonging to calendar.
           *   2. switching from one to all calendars: fade in all tasks except the ones from the previous selected calendar.
           *   3. switching from one to another calendar: fade out all tasks and fade in all tasks.
           */
          var oldValue = this.value, handler;
          PreferenceStore.setPreferenceForKey((this.value = this.element.value), "selectedCalendar");
          // scenario 1:
          if(oldValue == "all") {
            var elements = Display.list.childNodes, i = -1;
            var elementsToHide = [];
            while(++i < elements.length)
              if(TaskStore.taskWithUID(elements[i].getAttribute("id")).calendarUID != this.value)
                elementsToHide.push({
                  element: elements[i],
                  height: parseInt(document.defaultView.getComputedStyle(elements[i], null).getPropertyValue("height"))
                });

            // if all calendars will be removed we fade out.
            if(elementsToHide.length == Display.list.childNodes.length) {
              handler = function(animation, current, start, finish) {
                Display.list.style.opacity = current;
                if(current <= 0) {
                  Display.list.innerHTML = "";
                  Display.list.style.opacity = 1;
                  Display.autoAdjustHeightAndScrollbar();
                  Navigation.selectedTasks = [];
                }
              };
            } else {
              handler = function(animation, current, start, finish) {
                var i = -1;
                while(++i < elementsToHide.length) {
                  elementsToHide[i].element.style.opacity = current;
                  elementsToHide[i].element.style.height = current*elementsToHide[i].height + "px";
                }
                if(0>=current) {
                  i = -1;
                  while(++i < elementsToHide.length) {
                    TaskStore.spliceTaskWithUID(elementsToHide[i].element.getAttribute("id"));
                    Display.list.removeChild(elementsToHide[i].element);
                  }
                  Navigation.reselectTasks();
                  delete elementsToHide;
                  Display.autoAdjustHeightAndScrollbar();
                }
              };
            }
          }
          // scenario 2:
          else if(this.value == "all") {
            if(Display.list.childNodes.length > 0)
              HTMLBridge.displayTasks(oldValue);
            else
              HTMLBridge.displayTasks();
          }
          // scenario 3:
          else {
            handler = function(animation, current, start, finish) {
              Display.list.style.opacity = current;
              if(current <= 0)
                HTMLBridge.displayTasks();
            };
          }
          new AppleAnimator(400, 13, 1, 0, handler).start();
        }
      },
      buildSelect: function() {
        // load calendars from plugin and create HTML
        var calendars = CalendarStore.calendars();
        var optgroup = this.element.childNodes[1];
        optgroup.innerHTML="";
        var option, optionTxt, i = -1;

        while(++i < calendars.length) {
          option = document.createElement("option");
          option.setAttribute("value", calendars[i].uid);
          option.setAttribute("id", calendars[i].uid);
          option.appendChild(document.createTextNode(calendars[i].title));
          optgroup.appendChild(option);
        }

        this.element.value = this.value;

        // detect if a not existing calendar was last saved
        if(this.element.value != this.value && this.value != "all") {
          this.value = "all";
          PreferenceStore.setPreferenceForKey("all", "selectedCalendar");
          HTMLBridge.displayTasks();
        }
      },
      calendarsChanged: function(action, uidCollection) {
        switch (action) {
          case "add":
            this.addCalendars(uidCollection);
            break;
          case "remove":
            this.removeCalendars(uidCollection);
            break;
          case "update":
            this.updateCalendars(uidCollection);
            break;
        }
      },
      addCalendars: function(uidCollection) {
        var i = -1, optgroup = this.element.childNodes[1], option, calendar;
        while(++i < uidCollection.length) {
          calendar = CalendarStore.calendarWithUID(uidCollection[i]);
          option = document.createElement("option");
          option.setAttribute("value", calendar.uid);
          option.setAttribute("id", calendar.uid);
          option.appendChild(document.createTextNode(calendar.title));
          optgroup.appendChild(option);
        }
        // for calendars created through the widget
        if(this.shouldSelectCalendarWithUID && uidCollection.indexOf(this.shouldSelectCalendarWithUID) >= 0) {
          PreferenceStore.setPreferenceForKey((this.value = this.element.value = this.shouldSelectCalendarWithUID), "selectedCalendar");
          delete this.shouldSelectCalendarWithUID;
        }
      },
      removeCalendars: function(uidCollection) {
        var i = -1, optgroup = this.element.childNodes[1];
        while(++i < uidCollection.length)
          optgroup.removeChild(document.getElementById(uidCollection[i]));
        if(uidCollection.indexOf(PreferenceStore.preferenceForKey("selectedCalendar")) >= 0) {
          PreferenceStore.setPreferenceForKey((this.value = "all"), "selectedCalendar");
          HTMLBridge.displayTasks();
        }
      },
      updateCalendars: function(uidCollection) {
        var i = -1;
        while(++i < uidCollection.length)
          document.getElementById(uidCollection[i]).firstChild.nodeValue = CalendarStore.calendarWithUID(uidCollection[i]).title;
      }
    },
  // font size preference:
  //    defines the font size at which the tasks are displayed.
  //    default is medium (=m)
    fontSize: {
      initialize: function() {
        this.element = document.getElementById("fontSizePreference");
        this.element.value = this.value = PreferenceStore.preferenceForKey("fontSize") || "m";

        var self = this;
        this.element.addEventListener("change", function() { self.change.apply(self); }, false);

        Display.list.setAttribute("size", this.value);
      },
      change: function() {
        Display.list.setAttribute("size", (this.value = this.element.value));
        PreferenceStore.setPreferenceForKey(this.value, "fontSize");
      }
    },
  // font family preference:
  //    defines the font family
  //    default is Marker Felt
    fontFamily: {
      initialize: function() {
        this.element = document.getElementById("fontFamilyPreference");
        this.otherElement = document.getElementById("otherFontFamilyPreference");

        var self = this;

        this.otherElement.addEventListener(
          "keydown",
          function(event) {
            // when we press enter, save it:
            if(event.keyCode == 13) {
              self.otherElement.blur();
              self.otherElement.focus();
            } else if(event.keyCode == 9 && event.shiftKey != true) {
              document.getElementById("fontSizePreference").focus();
              event.stopPropagation();
              event.preventDefault();
            }
          }, false
        );

        this.value = PreferenceStore.preferenceForKey("fontFamily") || "MarkerFelt-Thin";
        var isOtherFont = !this.value.indexOf("other|");

        if(isOtherFont == true) {
          this.value = this.value.replace(/other\|/, "");
          this.element.value = "other";
          this.otherElement.style.display = "block";
          this.otherElement.value = this.value;
        } else
          this.element.value = this.value;

        this.element.addEventListener("change", function() { self.change.apply(self); }, false);

        this.otherElement.addEventListener("blur", function() { self.setOtherFont.apply(self); }, false);

        Display.list.style.fontFamily = "'"+(this.value)+"', 'MarkerFelt-Thin', sans-serif";
      },
      change: function() {
        if(this.element.value == "other") {
          this.otherElement.style.display = "block";
          this.otherElement.value = "";
          this.otherElement.focus();
          this.otherElement.select();
        } else {
          this.otherElement.style.display = "";
          this.otherElement.value = "";
          Display.list.style.fontFamily = "'"+(this.value = this.element.value)+"', 'MarkerFelt-Thin', sans-serif";
          PreferenceStore.setPreferenceForKey(this.value, "fontFamily");
        }
      },
      setOtherFont: function() {
        if(this.element.value == "other") {
          Display.list.style.fontFamily = "'"+(this.value = this.otherElement.value)+"', 'MarkerFelt-Thin', sans-serif";
          PreferenceStore.setPreferenceForKey("other|"+this.value, "fontFamily");
        } else {
          this.otherElement.value = "";
        }
      }
    },
  // sort key preference:
  //    defines how the tasks are sorted (default: due date)
    sortKey: {
      initialize: function() {
        this.element = document.getElementById("sortKeyPreference");
        this.element.value = this.value = PreferenceStore.preferenceForKey("sortKey") || "dueDate";
        // backwards compatibility
        if(this.value == "calendar.title")
          PreferenceStore.setPreferenceForKey((this.element.value = this.value = "calendar"), "sortKey");

        var self = this;
        this.element.addEventListener("change", function() { self.change.apply(self); }, false);
      },
      change: function() {
        PreferenceStore.setPreferenceForKey((this.value = this.element.value), "sortKey");
        HTMLBridge.displayTasks();
      }
    }
  };

  window.addEventListener("load", function() { initialize.apply(self); }, false);
})();
