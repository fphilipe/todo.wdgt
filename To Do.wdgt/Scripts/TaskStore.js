var Task = function(taskAttributes) {
  this.uid =           taskAttributes[0];
  this.title =         taskAttributes[1];
  this.dueDate =       taskAttributes[2];
  this.notes =         taskAttributes[3];
  this.priority =      taskAttributes[4];
  this.url =           taskAttributes[5];
  this.isCompleted =   taskAttributes[6];
  this.completedDate = taskAttributes[7];
  this.isOverdue =     taskAttributes[8];
  this.calendarUID =   taskAttributes[9];

  // retrieves the calendar object the task belongs to
  this.calendar = function() {
    return CalendarStore.calendarWithUID(this.calendarUID);
  }

  /*
  Removes a task that matches the specified unique identifier from the calendar store.
  Returns true if successful, otherwise false.
  */
  this.remove = function() {
    return Plugin.removeTaskWithUID(this.uid);
  }

  /*
  Toggles the completeness of a task.
  Returns true if successful, otherwise false.
  */
  this.toggleCompleteness = function() {
    return Plugin.toggleCompletenessForTaskWithUID(this.uid);
  }

  /*
  Sets the priority of a task.
  Returns true if successful, otherwise false.
  */
  this.setPriority = function(priority) {
    alert("setting priority to "+priority);
    if(PreferenceStore.preferenceForKey("showPriority") === true)
      return Plugin.setPriorityForTaskWithUID(parseInt(priority), this.uid);
  }

  /*
  Sets the title of a task.
  Returns true if successful, otherwise false.
  */
  this.setTitle = function(title) {
    return Plugin.setTitleForTaskWithUID(title, this.uid);
  }

  /*
  Opens the url of a task if available.
  */
  this.openURL = function() {
    if(this.url !== false)
      Plugin.openURL(this.url);
  }
}

// Method to easily insert elements at a specific index into an array.
// Used for the sorting algorithm.
Array.prototype.insertElementAtIndex = function(e, i) {
  var after = this.slice(i,this.length);
  this.splice(i,this.length,e);
  var i = -1;
  while(++i < after.length)
    this.push(after[i]);
}

// TaskStore: Holds and manages all tasks and the connection to the cocoa plugin.
var TaskStore = new (function() {
  var self = this;

  // holds all tasks
  var tasks = [];

  /*
  Returns a task that matches the specified unique identifier.
  */
  this.taskWithUID = function(uid) {
    if(!uid) return undefined;
    var i = -1;
    while(++i < tasks.length)
      if(tasks[i].uid == uid)
        return tasks[i];
    return undefined;
  }

  /*
   * Compares a task to the existing task to verify if a change happend
   */
  this.isEqualToExistingTask = function(task) {
    var oldTask = this.taskWithUID(task.uid);
    return (oldTask &&
        oldTask.title == task.title &&
        oldTask.priority == task.priority &&
        oldTask.notes == task.notes &&
        oldTask.dueDate == task.dueDate &&
        oldTask.isCompleted == task.isCompleted &&
        oldTask.completedDate == task.completedDate &&
        oldTask.url == task.url &&
        oldTask.isOverdue == task.isOverdue);
  }

  // removes a task from the local storage for better performance.
  // DOES NOT REMOVE IT FROM THE MAC CALENDAR STORE.
  this.spliceTaskWithUID = function(uid) {
    if(!uid) return;
    var index;
    if((index = this.indexOfTaskWithUID(uid)) >= 0)
      tasks.splice(index, 1);
  }

  // returns all tasks for a specific calendar
  this.tasksBelongingToCalendarWithUID = function(uid) {
    var i = -1, ret = [];
    while(++i < tasks.length)
      if(tasks[i].calendarUID == uid)
        ret.push(tasks[i]);
    return ret;
  }

  // Returns the index of a task by the specified uid. Returns -1 if nothing is found.
  this.indexOfTaskWithUID = function(uid) {
    if(!uid) return -1;
    var task;
    if(task = this.taskWithUID(uid))
      return tasks.indexOf(task);
    else return -1;
  }

/*========== Method for reloading all tasks, used when initially
       loaded or the calendar to display changes       ===========*/

  // defines if the tasks were accessed.
  // only used when widget loads task for the first time.
  var tasksWereAccessed = false;

  // returns the already loaded tasks or loads it and returns it
  this.loadAndReturnTasks = function() {
    if(tasksWereAccessed == false) {
      tasksWereAccessed = true;
      return tasks;
    }
    return loadTasks();
  }

  var loadTasks = function() {
    var loadedTaskCollection;
    if(loadedTaskCollection = Plugin.tasks()) {
      tasks = [];
      var i = -1;
      while(++i < loadedTaskCollection.length)
        tasks.push(new Task(loadedTaskCollection[i]));
      return tasks;
    }
    return undefined;
  }

/*========== Methods called only by the plugin ===========*/

  /*
  Removes all specified tasks. Called when an external modification of the tasks occurs.
  */
  this._removeTasks = function(uidCollection) {
    if(!uidCollection || uidCollection.constructor !== Array) return;
    var i = -1, task;
    while(++i < uidCollection.length) {
      task = this.taskWithUID(uidCollection[i]);
      tasks.splice(tasks.indexOf(task), 1);
    }

    notifyObservers("remove", uidCollection);
  }

  /*
  Adds new tasks. Called by the plugin when new tasks are created.
  */
  this._addTasks = function(taskCollection) {
    if(!taskCollection || taskCollection.constructor !== Array || taskCollection.length == 0) return;
    var i = -1, task, uidCollection = [], newTasks = [];
    while(++i < taskCollection.length) {
      task = new Task(taskCollection[i]);
      newTasks.push({ task: task, index: Plugin.indexOfTaskWithUID(task.uid) });
    }

    // sort the array containing the tasks
    newTasks.sort(function(a, b) {
      return a.index - b.index;
    });
    i = -1;
    while(++i < newTasks.length) {
      uidCollection.push(newTasks[i].task.uid);
      tasks.insertElementAtIndex(newTasks[i].task, newTasks[i].index);
    }

    notifyObservers("add", uidCollection);
  }

  /*
  Updates tasks by overwriting the present version. Called by the plugin when a change happens
  */
  this._updateTasks = function(taskCollection) {
    alert("update");
    if(!taskCollection || taskCollection.constructor !== Array || taskCollection.length == 0) return;
    var i = -1, task, uidCollection = [], updatedTasks = [];
    while(++i < taskCollection.length) {
      task = new Task(taskCollection[i]);
      //if(!this.isEqualToExistingTask(task)) {
        updatedTasks.push({ task: task, index: Plugin.indexOfTaskWithUID(task.uid) });
        tasks.splice(tasks.indexOf(this.taskWithUID(task.uid)), 1);
      //}
    }

    // sort the array containing the tasks
    updatedTasks.sort(function(a, b) {
      return a.index - b.index;
    });
    i = -1;
    while(++i < updatedTasks.length) {
      uidCollection.push(updatedTasks[i].task.uid);
      tasks.insertElementAtIndex(updatedTasks[i].task, updatedTasks[i].index);
    }

    // if a task is being edited and it was updated externaly, hide the edit hud.
    if(Navigation.selectedTasks.length == 1 && uidCollection.indexOf(Navigation.selectedTasks[0]) >= 0)
      HUD.hideHUDsWhichEditTasks();

    notifyObservers("update", uidCollection);
  }

/*========== Observation ==========*/

  // Array to store the observers
  var observers = [];

  // Method that allows other objects to register as observers
  // by passing a method
  // which will be called when any change happens
  this.observe = function(owner, observerMethod) {
    if(observerMethod)
      observers.push({ owner: owner, method: observerMethod });
  }

  var notifyObservers = function(notification, uidCollection) {
    var i = -1;
    while(++i < observers.length)
      observers[i].method.apply(observers[i].owner, [notification, uidCollection]);
  }

  loadTasks();
})();
