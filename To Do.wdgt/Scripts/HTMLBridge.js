var HTMLBridge = new (function() {
  var self = this;
  var loaded = false;

  var initialize = function() {
    // HTML UL Element to display the task list. #list
    //Display.list = document.getElementById("list");
    loaded = true;
    this.displayTasks();
  }

/*========= Drawing =========*/

  // deletes all contents of the list and rebuilds it
  this.displayTasks = function(lastShownCalendar) {
    if(loaded == false) return;
    Display.list.innerHTML = "";
    var tasks;
    if(tasks = TaskStore.loadAndReturnTasks()) {
      var i = -1;

      while(++i < tasks.length)
        Display.list.appendChild(elementForTask(tasks[i]));

      Navigation.reselectTasks();

      if(Display.isHidden == false) {
        var handler;
        if(lastShownCalendar) {
          var i = -1, elementsToShow = [], element;
          Display.autoAdjustHeightAndScrollbar();
          // get all tasks not belonging to last shown calendar:
          while(++i < tasks.length) {
            if(tasks[i].calendarUID != lastShownCalendar) {
              element = document.getElementById(tasks[i].uid);
              elementsToShow.push({
                element: element,
                height: parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("height"))
              });
              element.style.height = 0;
              element.style.opacity = 0;
            }
          }
          handler = function(animation, current, start, finish) {
            var i = -1;
            while(++i < elementsToShow.length) {
              elementsToShow[i].element.style.opacity = current;
              elementsToShow[i].element.style.height = current*elementsToShow[i].height + "px";
            }
            if(current>=1) {
              delete elementsToHide;
            }
          };
        } else {
          Display.list.style.opacity = 0;
          Display.autoAdjustHeightAndScrollbar();
          handler = function(animation, current, start, finish) {
            Display.list.style.opacity = current;
          };
        }
        new AppleAnimator(400, 13, 0, 1, handler).start();
      } else {
        Display.autoAdjustHeightAndScrollbar();
      }
    }
  }

  // returns an LI element for the specified task
  var elementForTask = function(task) {
    if(!task) return;

    // list item
    var li = document.createElement("li");
    li.setAttribute("id", task.uid);

    // checkbox
    var checkbox = document.createElement("div");
    checkbox.setAttribute("class", "checkbox");   // checkbox color

    var showCalendarColor = PreferenceStore.preferenceForKey("showCalendarColor");
    var colorBox = document.createElement("div");
    colorBox.style.backgroundColor = (showCalendarColor == true) ? task.calendar().colorString() : "#D6AB21";
    checkbox.appendChild(colorBox);

    var checkboxImage = document.createElement("div");
    checkbox.appendChild(checkboxImage);

    checkbox.setAttribute("checked", task.isCompleted+"");
    checkbox.setAttribute("overdue", task.isOverdue+"");

    // observe the checkbox to change the tasks completeness
    checkbox.addEventListener(
      'click',
      function(event) {
        task.toggleCompleteness.apply(task);
        event.stopPropagation();
        event.preventDefault();
      },
      false
    );
    li.appendChild(checkbox);

    // priority
    var priority = document.createElement("div");
    priority.setAttribute("priority", task.priority+"");

    var select = document.createElement("select");

    var optNone = document.createElement("option");
    optNone.setAttribute("value", "0");
    var optNoneTxt = document.createTextNode(Localization.localizedStringForKey("None"));
    optNone.appendChild(optNoneTxt);
    select.appendChild(optNone);

    var optLow = document.createElement("option");
    optLow.setAttribute("value", "9");
    var optLowTxt = document.createTextNode(Localization.localizedStringForKey("Low"));
    optLow.appendChild(optLowTxt);
    select.appendChild(optLow);

    var optMedium = document.createElement("option");
    optMedium.setAttribute("value", "5");
    var optMediumTxt = document.createTextNode(Localization.localizedStringForKey("Medium"));
    optMedium.appendChild(optMediumTxt);
    select.appendChild(optMedium);

    var optHigh = document.createElement("option");
    optHigh.setAttribute("value", "1");
    var optHighTxt = document.createTextNode(Localization.localizedStringForKey("High"));
    optHigh.appendChild(optHighTxt);
    select.appendChild(optHigh);

    select.value = task.priority;

    select.addEventListener(
      'change',
      function(event) {
        task.setPriority.apply(task, [this.value]);
        event.stopPropagation();
        event.preventDefault();
      },
      false
    );

    priority.appendChild(select);

    li.appendChild(priority);

    // title
    var p = document.createElement("p");
    var span = document.createElement("span");
    p.addEventListener(
      'click',
      function(event) {
        var id = this.parentNode.getAttribute("id");
        // start editing if only this task is selected
        if(Navigation.selectedTasks.indexOf(id) == 0 && Navigation.selectedTasks.length == 1)
          Navigation.startEditingTask(id);
        // select task if no other tasks are selected
        else if(Navigation.tasksSelected() === false)
          Navigation.selectTask(id);
        // if various tasks are selected, check what to do
        else if(Navigation.tasksSelected() === true) {
          // if this task is selected
          if(Navigation.selectedTasks.indexOf(id) >= 0) {
            // unselect task if command was pressed
            if(event.metaKey === true)
              Navigation.unselectTask(id);
            // unselect all others
            else
              Navigation.unselectAllTasksExceptForTask(id);
          }
          // if it's not selected
          else {
            // unselect task if command was pressed
            if(event.metaKey === true)
              Navigation.selectTask(id);
            // unselect all others
            else
              Navigation.unselectAllTasksAndSelectTask(id);
          }
        }
        event.stopPropagation();
        event.preventDefault();
      },
      false
    );

    p.addEventListener(
      'dblclick',
      function(event) {
        event.stopPropagation();
        event.preventDefault();
      },
      false
    );

    // if task has due date, display it
    var titleAttr = [];
    if(PreferenceStore.preferenceForKey("singleLine") == true)
      titleAttr.push(task.title);
    if(task.dueDate != false)
      titleAttr.push(Localization.localizedStringForKey("Due Date")+": "+task.dueDate);
    if(task.isCompleted)
      titleAttr.push(Localization.localizedStringForKey("Completed")+": "+task.completedDate);
    if(task.notes != false)
      titleAttr.push(Localization.localizedStringForKey("Notes")+":\n"+task.notes);
    if(task.url != false)
      titleAttr.push(Localization.localizedStringForKey("URL")+": "+task.url);
    if(PreferenceStore.preferenceForKey("selectedCalendar") == "all")
      titleAttr.push(Localization.localizedStringForKey("Calendar")+": "+task.calendar().title);
    p.setAttribute("title", titleAttr.join("\n┈┈┈┈┈┈┈┈┈┈┈\n"));

    // date
    if(task.dueDate != false && PreferenceStore.preferenceForKey("showDueDate") == true) {
      var date = document.createElement("strong");
      date.style.color = (showCalendarColor == true) ? task.calendar().colorString() : "#D6AB21";
      var innerSpan = document.createElement("strong");
      innerSpan.appendChild(document.createTextNode(task.dueDate));
      date.appendChild(innerSpan);
      p.appendChild(date);
      p.appendChild(document.createElement("br"));
    }

    var title = document.createTextNode((task.title == "") ? " " : task.title);
    span.appendChild(title);
    p.appendChild(span);
    li.appendChild(p);

    return li;
  }

  // inserts a task element into the list at a specified index
  var insertElementAtIndex = function(element, index) {
    if(element == undefined || index == undefined) return;
    var childs = Display.list.childNodes;
    if(childs.length == 0 || index >= childs.length)
      Display.list.appendChild(element);
    else
      Display.list.insertBefore(element, childs[index]);
    if(Display.isHidden == true) {
      return;
    }
    element.style.display = "none";
    element.style.display = "";
    var height = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("height"));
    element.style.height = "0";
    var handler = function(animation, current, start, finish) {
      element.style.opacity = current;
      element.style.height = current*height + "px";
      element.scrollIntoViewIfNeeded();
      if(1<=current) {
        element.style.height = "";
        element.style.opacity = "";
      }
    };
    var multiplier = (event && event.shiftKey) ? 10 : 1; // enable slo-mo
    new AppleAnimator(400*multiplier, 13, 0, 1, handler).start();
  }

  // removes a task with a specified uid by fading it out
  var fadeOutElementWithUID = function(uid) {
    if(!uid) return;

    var element = document.getElementById(uid);
    if(!element) return;

    if(Display.isHidden == true) {
      Display.list.removeChild(element);
      Display.autoAdjustHeightAndScrollbar();
    } else {
      var height = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("height"));
      handler = function(animation, current, start, finish) {
        element.style.opacity = current;
        element.style.height = current*height + "px";
        if(0>=current) {
          Display.list.removeChild(element);
        }
      };
      var multiplier = (event && event.shiftKey) ? 10 : 1; // enable slo-mo
      new AppleAnimator(400*multiplier, 13, 1, 0, handler).start();
    }
  }

/*========== Observing Notifications and Methods ==========*/

  // called by TaskStore when a change happens
  var tasksChanged = function(action, uidCollection) {
    switch (action) {
      case "add":
        addTasks(uidCollection);
        break;
      case "remove":
        removeTasks(uidCollection);
        break;
      case "update":
        updateTasks(uidCollection);
        break;
    }
  }

  // called by tasksChanged method when tasks were added
  var addTasks = function(uidCollection) {
    var i = -1;
    var selectedCalendar = PreferenceStore.preferenceForKey("selectedCalendar");
    while(++i < uidCollection.length) {
      insertElementAtIndex(
        elementForTask(TaskStore.taskWithUID(uidCollection[i])),
        TaskStore.indexOfTaskWithUID(uidCollection[i])
      );
    }
    if(self.animationTimeout) {
      clearTimeout(self.animationTimeout);
    }
    self.animationTimeout = setTimeout(function() { delete self.animationTimeout; Display.autoAdjustHeightAndScrollbar(); }, 500);
  }

  // called by tasksChanged method when tasks were removed
  var removeTasks = function(uidCollection) {
    var i = -1;
    while(++i < uidCollection.length)
      fadeOutElementWithUID(uidCollection[i]);
    if(self.animationTimeout) {
      clearTimeout(self.animationTimeout);
    }
    self.animationTimeout = setTimeout(function() { delete self.animationTimeout; Display.autoAdjustHeightAndScrollbar(); }, 500);
  }

  // called by tasksChanged method when tasks were updated
  var updateTasks = function(uidCollection) {
    var i = -1, task, element;
    while(++i < uidCollection.length) {
      task = TaskStore.taskWithUID(uidCollection[i]);
      Display.list.removeChild(document.getElementById(uidCollection[i]));
      var index = TaskStore.indexOfTaskWithUID(uidCollection[i]);
      if(index >= Display.list.childNodes.length)
        Display.list.appendChild(elementForTask(task));
      else
        Display.list.insertBefore(elementForTask(task), Display.list.childNodes[index]);
    }
    if(self.animationTimeout) {
      clearTimeout(self.animationTimeout);
    }
    self.animationTimeout = setTimeout(
      function() {
        delete self.animationTimeout;
        Display.autoAdjustHeightAndScrollbar();
      }, 500);
  }

  // called by CalendarStore when a change happens
  var calendarsChanged = function(action, uidCollection) {
    if(PreferenceStore.preferenceForKey("showCalendarColor") == false) return;
    if(action == "update") {
      var i = j = -1, tasks, calendar;
      var selectedCalendar = PreferenceStore.preferenceForKey("selectedCalendar");
      // update colors of checkboxes
      if(selectedCalendar != "all") {
        // if only one calendar is shown, verify if the selected calendar was changed.
        // if not no modification is needed.
        calendar = CalendarStore.calendarWithUID(selectedCalendar);
        if(uidCollection.indexOf(calendar.uid) == -1) return;

        tasks = calendar.tasks();
        while(++j < tasks.length)
          document.getElementById(tasks[j].uid).firstChild.firstChild.style.backgroundColor = calendar.colorString();

      } else {
        // for every changed calendar we adjust the colors of the boxes and due dates.
        while(++i < uidCollection.length) {
          calendar = CalendarStore.calendarWithUID(uidCollection[i]);
          tasks = calendar.tasks();
          var date;
          while(++j < tasks.length) {
            date = document.getElementById(tasks[j].uid).getElementsByTagName("strong");
            if(date.length == 2)
              date[0].style.color = calendar.colorString();
            document.getElementById(tasks[j].uid).firstChild.firstChild.style.backgroundColor = calendar.colorString();
          }
        }
      }
    }
  }

  // call the initialization method when the DOM loaded
  // because it only works, when all elements are loaded
  window.addEventListener("load", function() { initialize.apply(self); }, false);

  // observe the TaskStore to display any possible changes
  TaskStore.observe(this, tasksChanged);
  // observe the CalendarStore to change the task color
  CalendarStore.observe(this, calendarsChanged);
})();
