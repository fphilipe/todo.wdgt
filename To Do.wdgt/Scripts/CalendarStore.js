/*
Calendar constructor. Receives an array which contains the properties of a calendar
and transforms it into an object.
*/
var Calendar = function(calendarAttributes) {
  this.uid =        calendarAttributes[0];
  this.title =      calendarAttributes[1];
  this.isEditable = calendarAttributes[2];
  this.color = {
    red:   calendarAttributes[3],
    green: calendarAttributes[4],
    blue:  calendarAttributes[5]
  };

  /*
  Returns a calendar that matches the specified unique identifier.
  */
  this.colorString = function() {
    return "rgb("+this.color.red+", "+this.color.green+", "+this.color.blue+")";
  }


  // retrieves all tasks from the taskstore
  this.tasks = function() {
    return TaskStore.tasksBelongingToCalendarWithUID(this.uid);
  }
}

// CalendarStore: Holds and manages all calendars and the connection to the cocoa plugin.
var CalendarStore = new (function() {
  var self = this;

  var calendars = [];

  // method to load the calendars from the calendar store
  var loadCalendars = function() {
    var loadedCalendarCollection;
    if(loadedCalendarCollection = Plugin.calendars()) {
      calendars = [];
      var i = -1;
      while(++i < loadedCalendarCollection.length)
        calendars.push(new Calendar(loadedCalendarCollection[i]));
    }
  }

  /*
  Returns a calendar that matches the specified unique identifier.
  */
  this.calendarWithUID = function(uid) {
    if(!uid) return;
    var i = -1;
    while(++i < calendars.length)
      if(calendars[i].uid == uid)
        return calendars[i];
    return undefined;
  }

  // Returns an array of all calendars, which corresponds to the calendars array.
  this.calendars = function() {
    return calendars;
  }

  // Returns an array of all editable calendars, which corresponds to the calendars array.
  this.editableCalendars = function() {
    var editableCalendars = [], i = -1;
    while(++i < calendars.length)
      if(calendars[i].isEditable == true)
        editableCalendars.push(calendars[i]);
    return editableCalendars;
  }

  /*
  Removes all specified calendars from the local store.
  DOES NOT DELETE A CALENDAR, only localy.
  Called when an external deletition of the calendar occurs.
  */
  this._removeCalendars = function(uidCollection) {
    if(!uidCollection || uidCollection.constructor !== Array || uidCollection.length == 0) return;
    var i = -1, j = uidCollection.length;
    while(++i < calendars.length)
      if(uidCollection.indexOf(calendars[i].uid) >= 0) {
        calendars.splice(i--, 1);
        if(--j == 0) break;
      }
    notifyObservers("remove", uidCollection);
  }

  /*
  Removes all specified calendars from the local store.
  DOES NOT CREATE A CALENDAR, only localy.
  Called when a Calendar is created externally.
  */
  this._addCalendars = function(calendarCollection) {
    if(!calendarCollection || calendarCollection.constructor !== Array || calendarCollection.length == 0) return;
    var i = -1, uidCollection = [];
    while(++i < calendarCollection.length) {
      calendars.push(new Calendar(calendarCollection[i]));
      uidCollection.push(calendarCollection[i][0]);
    }
    notifyObservers("add", uidCollection);
  }

  /*
  Removes all specified calendars from the local store.
  DOES NOT MODIFY A CALENDAR, only localy.
  Called when an external modification of the calendar occurs.
  */
  this._updateCalendars = function(calendarCollection) {
    if(!calendarCollection || calendarCollection.constructor !== Array || calendarCollection.length == 0) return;
    var i = -1, calendar, oldCalendar, uidCollection = [];
    while(++i < calendarCollection.length) {
      calendar = new Calendar(calendarCollection[i]);
      oldCalendar = this.calendarWithUID(calendar.uid);
      // mac calendar store posts a notification when a task belonging to
      // a calendar is deleted or created. So we have to verify if the calendar itself
      // was modified.
      if(calendar.title === oldCalendar.title &&
         calendar.color.red === oldCalendar.color.red &&
         calendar.color.red === oldCalendar.color.red &&
         calendar.color.red === oldCalendar.color.red) continue;

      calendars[calendars.indexOf(this.calendarWithUID(calendar.uid))] = calendar;
      uidCollection.push(calendarCollection[i][0]);
    }
    if(uidCollection.length > 0)
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

  loadCalendars();
})();
