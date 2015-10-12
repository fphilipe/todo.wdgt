var Localization = new (function() {
  var self = this;

  var initialize = function() {
    // preferences: {
      document.getElementById("loc-sortby").firstChild.nodeValue = this.localizedStringForKey("Sort To Do’s by:");
      document.getElementById("loc-singleline").firstChild.nodeValue = this.localizedStringForKey("Show each To Do on a Single Line");
      document.getElementById("loc-showpriority").firstChild.nodeValue = this.localizedStringForKey("Show Priority");
      document.getElementById("loc-showcompleted").firstChild.nodeValue = this.localizedStringForKey("Show Completed To Do’s");
      document.getElementById("loc-showduedate").firstChild.nodeValue = this.localizedStringForKey("Show Due Date");
      document.getElementById("loc-strike").firstChild.nodeValue = this.localizedStringForKey("Strike Trough Completed To Do’s");
      document.getElementById("loc-showcolor").firstChild.nodeValue = this.localizedStringForKey("Show Calendar Colors");
      document.getElementById("loc-autoheight").firstChild.nodeValue = this.localizedStringForKey("Adjust Height to Content");
      document.getElementById("loc-font").firstChild.nodeValue = this.localizedStringForKey("Font:");
      document.getElementById("loc-duedate").firstChild.nodeValue = this.localizedStringForKey("Due Date");
      document.getElementById("loc-priority").firstChild.nodeValue = this.localizedStringForKey("Priority");
      document.getElementById("loc-title").firstChild.nodeValue = this.localizedStringForKey("Title");
      document.getElementById("loc-completeness").firstChild.nodeValue = this.localizedStringForKey("Accomplishment");
      document.getElementById("loc-calendar").firstChild.nodeValue = this.localizedStringForKey("Calendar");
      document.getElementById("loc-allcals").firstChild.nodeValue = this.localizedStringForKey("All Calendars");
      document.getElementById("loc-other").firstChild.nodeValue = this.localizedStringForKey("Other…");
      document.getElementById("donate").firstChild.nodeValue = this.localizedStringForKey("Donate");
      document.getElementById("help").firstChild.nodeValue = this.localizedStringForKey("Help");

      var limitTxt = this.localizedStringForKey("Hide after % day(s)").split(" % ");
      document.getElementById("loc-limit1").firstChild.nodeValue = limitTxt[0];
      document.getElementById("loc-limit2").firstChild.nodeValue = limitTxt[1];
    // }
    // front: {
      document.getElementById("calendar").setAttribute("title", this.localizedStringForKey("Show To Do’s in…"));
      document.getElementById("add").setAttribute("title", this.localizedStringForKey("New To Do…"));
      document.getElementById("remove").setAttribute("title", this.localizedStringForKey("Delete To Do…"));
      document.getElementById("edit").setAttribute("title", this.localizedStringForKey("Edit To Do…"));
      document.getElementById("loc-showin").setAttribute("label", this.localizedStringForKey("Show To Do’s in…"));
      document.getElementById("loc-cancel").firstChild.nodeValue = document.getElementById("loc-cancel2").firstChild.nodeValue = document.getElementById("loc-cancel3").firstChild.nodeValue = this.localizedStringForKey("Cancel");
      document.getElementById("loc-remind").firstChild.nodeValue = this.localizedStringForKey("Remind Me Later");
      document.getElementById("loc-details").firstChild.nodeValue = this.localizedStringForKey("Details…");
      document.getElementById("loc-install").firstChild.nodeValue = this.localizedStringForKey("Install");
      document.getElementById("loc-ok").firstChild.nodeValue = this.localizedStringForKey("OK");
      document.getElementById("loc-delete").firstChild.nodeValue = this.localizedStringForKey("Delete");
      document.getElementById("loc-createin").firstChild.nodeValue = this.localizedStringForKey("New To Do in…");
      document.getElementById("loc-new").firstChild.nodeValue = document.getElementById("loc-new2").firstChild.nodeValue = this.localizedStringForKey("New Calendar…");
      document.getElementById("newcalendarpromptvalue").setAttribute("placeholder", this.localizedStringForKey("Title"));
      document.getElementById("loc-create").firstChild.nodeValue = this.localizedStringForKey("Create Calendar");
      document.getElementById("general").firstChild.nodeValue = this.localizedStringForKey("General");
      document.getElementById("advanced").firstChild.nodeValue = this.localizedStringForKey("Advanced");
      document.getElementById("loc-done").firstChild.nodeValue = this.localizedStringForKey("Done");
      document.getElementById("duedateplaceholder").firstChild.nodeValue = this.localizedStringForKey("Due Date");
      document.getElementById("urlinput").setAttribute("placeholder", this.localizedStringForKey("URL"));
      document.getElementById("loc-notes").firstChild.nodeValue = this.localizedStringForKey("Notes");
    // }
  }

  // returns the localized string for a specific key. If none found, returns the key.
  this.localizedStringForKey = function(key) {
    try {
      var locString = localizedStrings[key];
      if(!locString) {
        alert("INFO: missing localization for key '"+key+"'");
        locString = key;
      }
    } catch (e) {}
    return locString;
  }

  window.addEventListener("load", function() { initialize.apply(self); }, false);
})();
