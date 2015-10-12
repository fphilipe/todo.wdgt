var HUD = new (function() {
  var self = this;

  this.HUDs = {
    deleteConfirmation: {
      confirm: function(event) {
        while(Navigation.selectedTasks.length > 0)
          TaskStore.taskWithUID(Navigation.selectedTasks[0]).remove();
        self.hideHUD(event);
      }
    },
    calendarSelection: {
      change: function(event) {
        self.hideHUD(event);
        if(this.input.value == "new") {
          var handler = function(newUID) {
            if(newUID && newUID != false) {
              Plugin.createTaskInCalendarWithUID(newUID);
            }
          }
          self.showNewCalendarPrompt(function() { handler.apply(self, arguments); });
        } else {
          Plugin.createTaskInCalendarWithUID(this.input.value);
        }
        this.input.blur();
        this.input.value = "none";
      },
      confirm: function() {
        if(this.input.value != "none")
          this.input.blur();
      }
    },
    updateInformation: {
      confirm: function(event) {
        self.hideHUD(event);
        widget.openURL(PreferenceStore.URLs.download);
      }
    },
    genericInformation: {
      confirm: function(event) {
        self.hideHUD(event);
      }
    },
    newCalendarPrompt: {
      confirm: function() {
        self.hideHUD(event);
        var newUID = Plugin.createCalendarWithTitle(this.input.value);
        if(newUID && newUID != false)
          self.newCalendarCallback(newUID);
        else
          self.showGenericInformation(Localization.localizedStringForKey("Error creating new calendar: Name is already being used."));
        this.input.value = "";
        delete self.newCalendarCallback;
      }
    },
    taskInfoEditing: {
      confirm: function(event) {
        Plugin.setNotesAndURLAndDueDateForTaskWithUID(
          this.notesInput.value,
          this.urlInput.value,
          (this.dueDateCheckbox.checked ? this.dueDateInput.dateValue() : null),
          Navigation.selectedTasks[0]
        );
        self.hideHUD(event);
        // remove the focus from the webplugin to be able to use keyboard again:
        document.getElementById("calendar").firstChild.focus();
      },
      cancel: function(event) {
        // remove the focus from the webplugin to be able to use keyboard again:
        document.getElementById("calendar").firstChild.focus();
      }
    }
  }

  var protection1, protection2;

  // if a hud is shown, the name is saved here.
  this.shownHUD = undefined;

  var initialize = function() {
    this.HUDs.deleteConfirmation.element = document.getElementById("deleteConfirmation");
    this.HUDs.calendarSelection.element = document.getElementById("calendarSelection");
    this.HUDs.updateInformation.element = document.getElementById("updateInformation");
    this.HUDs.genericInformation.element = document.getElementById("genericInformation");
    this.HUDs.newCalendarPrompt.element = document.getElementById("newCalendarPrompt");
    this.HUDs.taskInfoEditing.element = document.getElementById("taskInfoEditing");

    this.HUDs.calendarSelection.input = document.getElementById("calendarselectionvalue");
    this.HUDs.newCalendarPrompt.input = document.getElementById("newcalendarpromptvalue");

    this.HUDs.taskInfoEditing.notesInput = document.getElementById("notesinput");
    this.HUDs.taskInfoEditing.urlInput = document.getElementById("urlinput");
    this.HUDs.taskInfoEditing.dueDateInput = document.getElementById("duedateinput");
    this.HUDs.taskInfoEditing.dueDateCheckbox = document.getElementById("hasduedate");
    this.HUDs.taskInfoEditing.dueDatePlaceholder = document.getElementById("duedateplaceholder");

    protection1 = document.getElementById("protection1");
    protection2 = document.getElementById("protection2");

    // ad event listener to the due date checkbox
    this.HUDs.taskInfoEditing.dueDateCheckbox.onchange = function() {
      if(this.checked == true) {
        self.HUDs.taskInfoEditing.dueDatePlaceholder.style.visibility = "hidden";
        with(self.HUDs.taskInfoEditing.dueDateInput) {
          style.visibility = "visible";
          setToday();
          setFocus();
        }
      } else {
        self.HUDs.taskInfoEditing.dueDateInput.style.visibility = "hidden";
        self.HUDs.taskInfoEditing.dueDatePlaceholder.style.visibility = "visible";
      }
    }

    // add event listeners to the bottom bar + and - buttons
    document.getElementById("add").addEventListener("click", function() { self.showCalendarSelection.apply(self, arguments); }, false);
    document.getElementById("remove").addEventListener("click", function() { self.showDeleteConfirmation.apply(self, arguments); }, false);
    document.getElementById("edit").addEventListener("click", function() { self.showTaskInfoEditing.apply(self, arguments); }, false);

    // add event listener to all cancel buttons
    document.getElementById("loc-cancel").addEventListener("click", function() { self.hideHUD.apply(self, arguments); }, false);
    document.getElementById("loc-cancel2").addEventListener("click", function() { self.hideHUD.apply(self, arguments); }, false);
    document.getElementById("loc-cancel3").addEventListener("click", function() { self.hideHUD.apply(self, arguments); }, false);
    document.getElementById("loc-remind").addEventListener("click", function() { self.hideHUD.apply(self, arguments); }, false);

    // add event listeners to all confirming buttons
    this.HUDs.calendarSelection.input.addEventListener("change", function() { self.HUDs.calendarSelection.change.apply(self.HUDs.calendarSelection ,arguments); },false);

    document.getElementById("loc-details").addEventListener("click", function() { self.hideHUD.apply(self, arguments); widget.openURL(PreferenceStore.URLs.details); }, false);
    document.getElementById("loc-install").addEventListener("click", function() { self.HUDs.updateInformation.confirm.apply(self.HUDs.updateInformation ,arguments); }, false);

    document.getElementById("loc-ok").addEventListener("click", function() { self.HUDs.genericInformation.confirm.apply(self.HUDs.genericInformation ,arguments); }, false);

    document.getElementById("loc-delete").addEventListener("click", function() { self.HUDs.deleteConfirmation.confirm.apply(self.HUDs.deleteConfirmation ,arguments); }, false);

    document.getElementById("loc-create").addEventListener("click", function() { self.HUDs.newCalendarPrompt.confirm.apply(self.HUDs.newCalendarPrompt ,arguments); }, false);

    document.getElementById("loc-done").addEventListener("click", function() { self.HUDs.taskInfoEditing.confirm.apply(self.HUDs.taskInfoEditing ,arguments); }, false);


    // build calendar select:
    var calendars = CalendarStore.editableCalendars();
    var option;
    var i = -1;
    while(++i < calendars.length) {
      var option = document.createElement("option");
      option.appendChild(document.createTextNode(calendars[i].title));
      option.setAttribute("value", calendars[i].uid);
      option.setAttribute("id", "hud-"+calendars[i].uid);
      this.HUDs.calendarSelection.input.childNodes[1].appendChild(option);
    }

    // check for update here because update info needs HUD to be ready.
    // the timeout ensures that the widget is at its correct size.
    window.setTimeout(function() { Plugin.checkForUpdate(); }, 3000);
  }

  var HUDShown = false;
  var nextAnimation = [];

  // protect other content from being modified
  var toggleProtection = function() {
    protection1.style.display = protection2.style.display = (protection1.style.display == "block") ? "" : "block";
  }

  // private method to show a specific HUD
  var showHUD = function(element, event) {
    if(HUDShown == true) {
      nextAnimation.push(function() { showHUD.apply(this, [element, event]); });
      return;
    }
    HUDShown = true;
    this.shownHUD = element.getAttribute("id");
    toggleProtection();

    if(Display.isHidden == true) {
      element.style.display = "block";
      if(this.HUDs[this.shownHUD].input)
        this.HUDs[this.shownHUD].input.focus();
    } else {
      // display it to calculate height
      element.style.display = "block";
      var height = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("height"));
      element.style.height = 0;

      var self = this;
      var handler = function(animation, current, start, finish) {
        element.style.height = Math.sin(current*Math.PI*0.73)*height*(4/3)+"px";
        if(current >= 1)
          if(self.HUDs[self.shownHUD].input)
            self.HUDs[self.shownHUD].input.focus();
      };

      var multiplier = (event && event.shiftKey) ? 10 : 1;
      new AppleAnimator(350*multiplier, 13, 0, 1, handler).start();
    }
  }

  this.hidingHUD = false;

  // private method to hide a specific HUD
  var hideHUD = function(element, event) {

    if(Display.isHidden == true) {
      element.style.display = element.style.opacity = element.style.height = "";
      toggleProtection();
      HUDShown = false;
      this.shownHUD = undefined;
      if(nextAnimation.length > 0) {
        nextAnimation[0].apply(this);
        nextAnimation.splice(0, 1);
      }
    } else {
      this.hidingHUD = true;
      var height = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("height"));

      var self = this;
      var handler = function(animation, current, start, finish) {
        element.style.height = (height-current*10)+"px";
        element.style.opacity = 1-current;
        if(current >= 1) {
          self.hidingHUD = false;
          element.style.display = element.style.opacity = element.style.height = "";
          toggleProtection();
          HUDShown = false;
          self.shownHUD = undefined;
          if(nextAnimation.length > 0) {
            nextAnimation[0].apply(self);
            nextAnimation.splice(0, 1);
          }
        }
      };

      var multiplier = (event && event.shiftKey) ? 10 : 1; // enable slo-mo

      // Animation code
      new AppleAnimator(200*multiplier, 13, 0, 1, handler).start();
    }
  }

  this.hideHUD = function(event) {
    if(this.shownHUD != undefined && this.hidingHUD != true)
      hideHUD.apply(this, [this.HUDs[this.shownHUD].element, event]);
  }

  this.hideHUDsWhichEditTasks = function() {
    if(this.shownHUD == "deleteConfirmation" ||
       this.shownHUD == "taskInfoEditing")
       this.hideHUD();
  }

  // method to show delete confirmation
  this.showDeleteConfirmation = function(event) {
    if(!Navigation.tasksSelected()) return;
    var selectedCalendar, calendar;
    if((selectedCalendar = PreferenceStore.preferenceForKey("selectedCalendar")) != "all" &&
       (calendar = CalendarStore.calendarWithUID(selectedCalendar)).isEditable == false)
      this.showGenericInformation((Localization.localizedStringForKey("The calendar “%” is not editable. You cannot add, remove or edit To Do’s.")).replace(/%/, calendar.title), event);
    else
      showHUD.apply(this, [this.HUDs.deleteConfirmation.element, event]);
  }

  // method to show calendar selection
  this.showCalendarSelection = function(event) {
    var selectedCalendar, calendar, editableCalendars;
    if((selectedCalendar = PreferenceStore.preferenceForKey("selectedCalendar")) == "all" && (editableCalendars = CalendarStore.editableCalendars()).length == 1)
      Plugin.createTaskInCalendarWithUID(editableCalendars[0].uid);
    if(selectedCalendar == "all")
      showHUD.apply(this, [this.HUDs.calendarSelection.element, event]);
    else if((calendar = CalendarStore.calendarWithUID(selectedCalendar)).isEditable == false)
      this.showGenericInformation((Localization.localizedStringForKey("The calendar “%” is not editable. You cannot add, remove or edit To Do’s.")).replace(/%/, calendar.title), event);
    else
      Plugin.createTaskInCalendarWithUID(selectedCalendar);
  }

  // method to show update information. called by plugin.
  this.showUpdateInformation = function(thisVersion, newVersion) {
    document.getElementById("loc-update").innerHTML = (Localization.localizedStringForKey("New version %1 is available. You have version %2.")).replace(/%1/, newVersion).replace(/%2/, thisVersion);
    showHUD.apply(this, [this.HUDs.updateInformation.element]);
  }

  // method to show generic information with desired text.
  this.showGenericInformation = function(text, event) {
    genericInformation.getElementsByTagName("p")[0].firstChild.nodeValue = text || " ";
    showHUD.apply(this, [this.HUDs.genericInformation.element, event]);
  }

  // method to show generic information with desired text.
  this.showNewCalendarPrompt = function(callback, event) {
    this.newCalendarCallback = callback;
    showHUD.apply(this, [this.HUDs.newCalendarPrompt.element, event]);
  }

  // method to show task information to edit.
  this.showTaskInfoEditing = function(event) {
    if(Navigation.selectedTasks.length == 1) {
      var lineHeight = 13;
      var availableHeight = window.innerHeight-210+26;
      var lines = parseInt(availableHeight/lineHeight);
      if(lines < 2) lines = 2;
      else if(lines > 5) lines = 5;

      this.HUDs.taskInfoEditing.notesInput.style.height = lines*lineHeight+2+"px";

      var task = TaskStore.taskWithUID(Navigation.selectedTasks[0]);
      this.HUDs.taskInfoEditing.notesInput.value = (task.notes == undefined || task.notes == false) ? "" : task.notes;
      this.HUDs.taskInfoEditing.urlInput.value = (task.url == undefined || task.url == false) ? "" : task.url;

      var hasDueDate = (task.dueDate != false && task.dueDate != undefined);
      this.HUDs.taskInfoEditing.dueDateInput.style.visibility = (hasDueDate) ? "visible" : "hidden";
      this.HUDs.taskInfoEditing.dueDatePlaceholder.style.visibility = (hasDueDate) ? "hidden" : "visible";
      this.HUDs.taskInfoEditing.dueDateCheckbox.checked = hasDueDate;

      showHUD.apply(this, [this.HUDs.taskInfoEditing.element, event]);

      setTimeout(
        function() {
          if(hasDueDate) {
            with(self.HUDs.taskInfoEditing.dueDateInput) {
              setDateValue(Plugin.dueDateForTaskWithUID(task.uid));
              setFocus();
            }
          } else
            self.HUDs.taskInfoEditing.dueDateCheckbox.focus()
        }, 0);
    }
  }

  // Observation
  var calendarsChanged = function(action, uidCollection) {
    switch (action) {
      case "add":
        addCalendars.apply(this, [uidCollection]);
        break;
      case "remove":
        removeCalendars.apply(this, [uidCollection]);
        break;
      case "update":
        updateCalendars.apply(this, [uidCollection]);
        break;
    }
  }

  var addCalendars = function(uidCollection) {
    var i = -1, calendar, option;
    while(++i < uidCollection.length) {
      calendar = CalendarStore.calendarWithUID(uidCollection[i]);
      if(calendar.isEditable == false) continue;
      option = document.createElement("option");
      option.appendChild(document.createTextNode(calendar.title));
      option.setAttribute("value", calendar.uid);
      option.setAttribute("id", "hud-"+calendar.uid);
      this.HUDs.calendarSelection.input.childNodes[1].appendChild(option);
    }
  }
  var removeCalendars = function(uidCollection) {
    var i = -1, option;
    while(++i < uidCollection.length)
      if(option = document.getElementById("hud-"+uidCollection[i]))
        this.HUDs.calendarSelection.input.childNodes[1].removeChild(option);
  }
  var updateCalendars = function(uidCollection) {
    var i = -1, calendar;
    while(++i < uidCollection.length)
      if((calendar = CalendarStore.calendarWithUID(uidCollection[i])).isEditable == true)
        document.getElementById("hud-"+uidCollection[i]).firstChild.nodeValue = calendar.title;
  }

  CalendarStore.observe(this, calendarsChanged);
  window.addEventListener("load", function() { initialize.apply(self); }, false);
})();
