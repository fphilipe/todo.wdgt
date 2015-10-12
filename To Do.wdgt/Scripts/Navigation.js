var Navigation = new (function() {
  var self = this;

  var initialize = function() {
    // observe key strokes:
    document.addEventListener("keydown", function() { keyPressed.apply(self, arguments); }, false);
  }

  ////////////////// KEYBOARD SHORTCUTS /////////////////
  //VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//

  // method called when a key is pressed
  var keyPressed = function(event) {
    if(Display.isHidden === false && (!HUD.shownHUD || event.keyCode == 13 || event.keyCode == 27)) {
      var func;
      if(func = keyFunctions[event.keyCode])
        func.apply(keyFunctions, arguments);

      if(event.keyCode != 82) {
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }

  var keyFunctions = {
    // KEY:    enter
    // ACTION: Confirm dialog, else confirm editing or start editing.
    13: function(event) {
      if(HUD.shownHUD === undefined && Navigation.selectedTasks.length == 1) {
        // edit only when one task is selected
        Navigation.startEditingTask(Navigation.selectedTasks[0]);
      } else if(HUD.shownHUD !== undefined) {
        if(HUD.HUDs[HUD.shownHUD].confirm)
          HUD.HUDs[HUD.shownHUD].confirm();
      }
    },
    // KEY:    tab
    // ACTION: Move selection down or (+shift) up.
    9: function(event) {
      if(event.shiftKey == true)
        // up
        this['38']();
      else
        // down
        this['40']();
    },
    // KEY:    up
    // ACTION: Move selection one up.
    38: function() {
      if(Navigation.tasksSelected()) {
        var lastSelected = document.getElementById(Navigation.selectedTasks[Navigation.selectedTasks.length-1]), task;
        if(task = lastSelected.previousSibling)
          Navigation.unselectAllTasksAndSelectTask(task.getAttribute("id"));
        else
          Navigation.unselectAllTasksAndSelectTask(Display.list.lastChild.getAttribute("id"));
      } else {
        Navigation.unselectAllTasksAndSelectTask(Display.list.lastChild.getAttribute("id"));
      }
    },
    // KEY:    down
    // ACTION: Move selection one down.
    40: function() {
      if(Navigation.tasksSelected()) {
        var lastSelected = document.getElementById(Navigation.selectedTasks[Navigation.selectedTasks.length-1]), task;
        if(task = lastSelected.nextSibling)
          Navigation.unselectAllTasksAndSelectTask(task.getAttribute("id"));
        else
          Navigation.unselectAllTasksAndSelectTask(Display.list.firstChild.getAttribute("id"));
      } else {
        Navigation.unselectAllTasksAndSelectTask(Display.list.firstChild.getAttribute("id"));
      }
    },
    // KEY:    backspace
    // ACTION: Show delete confirmation.
    8: function(event) {
      HUD.showDeleteConfirmation(event);
    },
    // KEY:    delete
    // ACTION: Show delete confirmation.
    46: function(event) {
      this['8'](event);
    },
    // KEY:    escape
    // ACTION: Hide any HUDs.
    27: function(event) {
      if(HUD.shownHUD !== undefined) {
        HUD.hideHUD(event);
        if(HUD.HUDs[HUD.shownHUD].cancel)
          HUD.HUDs[HUD.shownHUD].cancel();
      }
    },
    // KEY:    space
    // ACTION: toggle completeness
    32: function() {
      var i = -1;
      while(++i < Navigation.selectedTasks.length)
        TaskStore.taskWithUID(Navigation.selectedTasks[i]).toggleCompleteness();
    },
    // KEY:    0
    // ACTION: set priority to none
    48: function() {
      var i = -1;
      while(++i < Navigation.selectedTasks.length)
        TaskStore.taskWithUID(Navigation.selectedTasks[i]).setPriority(0);
    },
    // KEY:    1
    // ACTION: set priority to low
    49: function() {
      var i = -1;
      while(++i < Navigation.selectedTasks.length)
        TaskStore.taskWithUID(Navigation.selectedTasks[i]).setPriority(9);
    },
    // KEY:    2
    // ACTION: set priority to medium
    50: function() {
      var i = -1;
      while(++i < Navigation.selectedTasks.length)
        TaskStore.taskWithUID(Navigation.selectedTasks[i]).setPriority(5);
    },
    // KEY:    3
    // ACTION: set priority to high
    51: function() {
      var i = -1;
      while(++i < Navigation.selectedTasks.length)
        TaskStore.taskWithUID(Navigation.selectedTasks[i]).setPriority(1);
    },
    // KEY:    cmd + i
    // ACTION: edit task info
    73: function(event) {
      if(event.metaKey && event.metaKey == true)
        HUD.showTaskInfoEditing.apply(HUD, arguments);
    },
    // KEY:    cmd + n
    // ACTION: new task
    78: function(event) {
      if(event.metaKey && event.metaKey == true)
        HUD.showCalendarSelection.apply(HUD, arguments);
    },
    // KEY:    cmd + u
    // ACTION: open url of task
    85: function(event) {
      if(event.metaKey && event.metaKey == true) {
        var i = -1;
        while(++i < Navigation.selectedTasks.length)
          TaskStore.taskWithUID(Navigation.selectedTasks[i]).openURL();
      }
    },
    // KEY:    cmd + a
    // ACTION: select all tasks
    65: function(event) {
      if(event.metaKey && event.metaKey == true) {
        var i = -1;
        Navigation.selectAllTasks();
      }
    }
  }

  //////// TASK EDITING ///////

  this.startEditingTask = function(id) {
    var task;
    if(task = document.getElementById(id)) {
      this.stopEditingTask();
      this.uidOfTaskBeingEdited = id;
      var span = task.getElementsByTagName("span")[0];
      span.parentNode.setAttribute("class", "editing");
      span.addEventListener("blur", function() { self.stopEditingTask.call(self); }, false);
      span.onclick = function(event) {
        event.stopPropagation();
      };
      span.addEventListener(
        "keydown",
        function(event) {
          // blur on enter and tab
          if(event.keyCode == 13 || event.keyCode == 9)
            this.blur();
          event.stopPropagation();
        },
        false
      );
      span.focus();
      window.getSelection().setBaseAndExtent(span, 0, span, span.childNodes.length);
    }
  }

  this.stopEditingTask = function() {
    if(this.uidOfTaskBeingEdited) {
      var span = document.getElementById(this.uidOfTaskBeingEdited).getElementsByTagName("span")[0];
      span.parentNode.removeAttribute("class");
      span.removeEventListener("blur", function() { self.stopEditingTask.call(self); }, false);
      span.onclick = undefined;
      span.removeEventListener(
        "keydown",
        function(event) {
          // blur on enter and tab
          if(event.keyCode == 13 || event.keyCode == 9)
            this.blur();
          event.stopPropagation();
        },
        false
      );

      var task;
      if(task = TaskStore.taskWithUID(this.uidOfTaskBeingEdited)) {
        if(task.title != span.innerText) {
          var textToSave = (span.firstChild.nodeValue == null) ? "" : span.innerText;
          if(!task.setTitle(textToSave))
            span.firstChild.nodeValue = (task.title == "") ? " " : task.title;
        } else {
          span.style.display = "none";
          setTimeout(function() { span.style.display = ""; }, 0);
        }
      }
      delete this.uidOfTaskBeingEdited;
    }
  }

  ////////////////// TASK SELECTION /////////////////
  //VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//

  // Method to select a task
  this.selectTask = function(id) {
    if(this.selectedTasks.indexOf(id) < 0) {
      var task = document.getElementById(id);
      task.setAttribute("selected", "true");
      this.selectedTasks.push(id);
      task.scrollIntoViewIfNeeded();
    }
  }

  // Method to unselect a task
  this.unselectTask = function(id) {
    if(this.selectedTasks.indexOf(id) >= 0) {
      document.getElementById(id).removeAttribute("selected");
      this.selectedTasks.splice(this.selectedTasks.indexOf(id), 1);
    }
  }

  // Method to select all tasks
  this.selectAllTasks = function() {
    var i = -1, tasks = Display.list.childNodes;
    while(++i < tasks.length)
      this.selectTask(tasks[i].getAttribute("id"));
  }

  // Method to unselect all tasks
  this.unselectAllTasks = function() {
    while(this.selectedTasks.length > 0)
      this.unselectTask(this.selectedTasks[0]);
  }

  // Method to unselect all selected tasks except for one specific
  this.unselectAllTasksExceptForTask = function(id) {
    var i = 0;
    while(this.selectedTasks.length > 1)
      if(this.selectedTasks[0] != id)
        this.unselectTask(this.selectedTasks[i]);
      else
        i++;
  }

  // Method to unselect all selected tasks and select one specific
  this.unselectAllTasksAndSelectTask = function(id) {
    this.unselectAllTasks();
    this.selectTask(id);
  }

  // Method called when the displayed calendar is changed to reselect the tasks
  this.reselectTasks = function() {
    var i = -1, task;
    while(++i < this.selectedTasks.length) {
      if(task = document.getElementById(this.selectedTasks[i])) {
        task.setAttribute("selected", "true");
      } else {
        this.selectedTasks.splice(i--, 1);
      }
    }
    // hide the delete confirmation when all selected tasks where deleted externaly
    if(this.selectedTasks.length > 0)
      HUD.hideHUDsWhichEditTasks();
  }

  /*// Method to toggle selection of a task
  this.toggleTaskSelection = function(id) {
    if(this.selectedTasks.indexOf(id) >= 0) {
      this.unselectTask(id);
    } else {
      this.selectTask(id);
    }
  }*/

  this.selectedTasks = [];
  this.tasksSelected = function() {
    return (this.selectedTasks.length == 0) ? false : true;
  }

  //----------------------

  // observe the TaskStore to remove uids from deleted tasks
  TaskStore.observe(
    this,
    function(action, uidCollection) {
      if(action == "remove" && this.tasksSelected() === true) {
        var i = -1, index;
        while(++i < uidCollection.length) {
          if((index = this.selectedTasks.indexOf(uidCollection[i])) >= 0)
            this.selectedTasks.splice(index, 1);
        }
      } else if(action == "update" && this.tasksSelected() === true) {
        var i = -1;
        while(++i < uidCollection.length) {
          if(this.selectedTasks.indexOf(uidCollection[i]) >= 0)
            document.getElementById(uidCollection[i]).setAttribute("selected", "true");
        }
      } else if(action == "add" && this.newTaskToSelect !== undefined) {
        this.unselectAllTasksAndSelectTask(this.newTaskToSelect);
        this.startEditingTask(this.newTaskToSelect);
        delete this.newTaskToSelect;
      }
    }
  );

  window.addEventListener("load", function() { initialize.apply(self); }, false)
})();
