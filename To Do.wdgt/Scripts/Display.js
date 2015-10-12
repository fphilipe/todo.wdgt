var Display = new (function() {
  var self = this;

  // determines if the widget is beeing displayed
  this.isHidden = false;
  // when auto hide task is active we need to verify the last time hte widget was shown.
  if(PreferenceStore.preferenceForKey("showCompletedTasks") == true && PreferenceStore.preferenceForKey("limitCompletedTasks"))
    this.lastShownDay = (new Date()).getDate();
  widget.onshow = function() {
    if(Display.lastShownDay && PreferenceStore.preferenceForKey("showCompletedTasks") == true && PreferenceStore.preferenceForKey("limitCompletedTasks"))
      if(Display.lastShownDay != (new Date()).getDate())
        HTMLBridge.displayTasks();
    self.isHidden = false;
  }
  widget.onhide = function() {
    self.isHidden = true;
    if(PreferenceStore.preferenceForKey("showCompletedTasks") == true && PreferenceStore.preferenceForKey("limitCompletedTasks"))
      Display.lastShownDay = (new Date()).getDate();
  }

  // top rings
  var rings, ringsright, ringsleft;

  var initialize = function() {
    // list may be already set by PreferenceStore because it needs to accesses it possibly before it would be set here.
    if(!this.list)
      this.list = document.getElementById("list");

    this.list.addEventListener(
      "click",
      function() {
        Navigation.unselectAllTasks();
      },
      false
    );
    this.list.addEventListener(
      "dblclick",
      function(event) {
        HUD.showCalendarSelection(event);
      },
      false
    );

    this.front = document.getElementById("front");
    this.back = document.getElementById("back");
    // create i-button
    new AppleInfoButton(document.getElementById("infobutton"), front, "white", "white", function() { self.flipToBack.apply(self, arguments); });
    // create done-button
    new AppleGlassButton(
      document.getElementById("glassbutton"),
      Localization.localizedStringForKey("Done"),
      function() {
        document.getElementById("completedTasksLimitationPreference").blur();
        document.getElementById("otherFontFamilyPreference").blur();
        self.flipToFront.apply(self, arguments);
      }
    );
    // create the scroll area and scroll bar
    var scrollBar = new AppleVerticalScrollbar(document.getElementById("scrollbar"));
    scrollBar.setSize(17);
    scrollBar.setTrackStart("Images/NoteScrollerTrackTop.tiff", 18);
    scrollBar.setTrackMiddle("Images/NoteScrollerTrackMiddle.tiff");
    scrollBar.setTrackEnd("Images/NoteScrollerTrackBottom.tiff", 18);
    scrollBar.setThumbStart("Images/NoteScrollerKnobTop.tiff", 9);
    scrollBar.setThumbMiddle("Images/NoteScrollerKnobMiddle.tiff");
    scrollBar.setThumbEnd("Images/NoteScrollerKnobBottom.tiff", 9);
    this.scrollArea = new AppleScrollArea(document.getElementById("scrollarea"), scrollBar);
    this.scrollArea.scrollsHorizontally = false;

    // top rings
    rings = document.getElementById("rings");
    ringsleft = document.getElementById("ringsleft");
    ringsright = document.getElementById("ringsright");

    // set the preferences navigation
    var generalPreferenceButton = document.getElementById("general");
    var advancedPreferenceButton = document.getElementById("advanced");
    advancedPreferenceButton.addEventListener("click", function() {
      if(this.getAttribute("class") == "selected") return;
      document.getElementById("preferences1").style.display = "none";
      document.getElementById("preferences2").style.display = "block";
      generalPreferenceButton.setAttribute("class", "unselected");
      advancedPreferenceButton.setAttribute("class", "selected");
    }, false);
    generalPreferenceButton.addEventListener("click", function() {
      if(this.getAttribute("class") == "selected") return;
      document.getElementById("preferences1").style.display = "block";
      document.getElementById("preferences2").style.display = "none";
      advancedPreferenceButton.setAttribute("class", "unselected");
      generalPreferenceButton.setAttribute("class", "selected");
    }, false);

    // preload images
    preloadImages();

    // animate widget to last known size
    if(PreferenceStore.preferenceForKey("autoAdjustHeight") == false) {
      if(this.widgetSize.w != this.widgetStandardSize.w || this.widgetSize.h != this.widgetStandardSize.h) {
        if(this.isHidden == true) {
          window.resizeTo(this.widgetSize.w, this.widgetSize.h);
        } else {
          rings.style.display = ringsleft.style.display = ringsright.style.display = "none";
          ringsresizing.style.display = "block";
          var handler = function(animation, current, start, finish) {
            window.resizeTo(240+(self.widgetSize.w-240)*current, 328+(self.widgetSize.h-328)*current);
            if(current >= 1) {
              var ringswidth = parseInt((self.widgetSize.w-30)/20)*20;
              rings.style.width = ringswidth+"px";
              setRingsSidesToWidth((self.widgetSize.w-ringswidth-30)/2);
              rings.style.display = ringsleft.style.display = ringsright.style.display = ringsresizing.style.display = list.style.display = "";
              self.scrollArea.refresh();
            }
          };
          new AppleAnimator(500, 13, 0, 1, handler).start();
        }
      }
    }
  }

  // method called at initialization to preload images// preload images
  var preloadImages = function() {
    var images = [
        "unchecked-box.png",
        "unchecked-pressed-box.png",
        "checked-box.png",
        "checked-pressed-box.png",
        "overdue-box.png",
        "Back.png",
        "hudbutton.png",
        "hudbutton-red.png",
        "hudbutton-pressed.png",
        "hudbutton-red-pressed.png",
        "hudbutton-blue.png",
        "hudbutton-blue-pressed.png",
        "hudselect-blue.png",
        "NoteScrollerKnobTop.tiff",
        "NoteScrollerKnobMiddle.tiff",
        "NoteScrollerKnobBottom.tiff",
        "NoteScrollerTrackTop.tiff",
        "NoteScrollerTrackMiddle.tiff",
        "NoteScrollerTrackBottom.tiff",
        "hud-bottom-left.png",
        "hud-bottom-right.png",
        "hud-bottom.png",
        "hud-corner-t-l.png",
        "hud-corner-t-r.png",
        "hud-corner-b-l.png",
        "hud-corner-b-r.png",
        "hud-side-l.png",
        "hud-side-t.png",
        "hud-side-r.png",
        "small-back-button-left.png",
        "small-back-button-right.png",
        "small-back-button-left-pressed.png",
        "small-back-button-right-pressed.png"
      ];
    var loadedImages = [];
    for(var i = 0; i < images.length; i++) {
      loadedImages[i] = new Image();
      loadedImages[i].src = "Images/"+images[i];
    }
    delete loadedImages;
  }

  this.flipToBack = function(event) {
    this.isHidden = true;

    var flipToBack = function() {
      widget.prepareForTransition("ToBack");
      front.style.visibility = "hidden";
      back.style.display = "block";
      setTimeout("widget.performTransition()", 0);
    }

    if(this.widgetSize.w == 240 && this.widgetSize.h == 328) {
      flipToBack();
      return;
    }

    rings.style.display = ringsleft.style.display = ringsright.style.display = "none";
    ringsresizing.style.display = "block";

    var handler = function(animation, current, start, finish) {
      window.resizeTo(240+(self.widgetSize.w-240)*current, 328+(self.widgetSize.h-328)*current);
      if(current <= 0)
        flipToBack();
    };

    var multiplier = ((event && event.shiftKey) ? 10 : 1); // enable slo-mo
    new AppleAnimator(500*multiplier, 13, 1, 0, handler).start();
  }

  this.flipToFront = function(event) {
    widget.prepareForTransition("ToFront");
    front.style.visibility = "";
    back.style.display = "";
    setTimeout("widget.performTransition()", 0);
    if(this.widgetSize.w == 240 && this.widgetSize.h == 328)
      return;
    setTimeout(
      function() {
        var handler = function(animation, current, start, finish) {
          window.resizeTo(
            240+(self.widgetSize.w-240)*current,
            (PreferenceStore.preferenceForKey("autoAdjustHeight") == false) ? 328+(self.widgetSize.h-328)*current : 328
          );
          if(current >= 1) {
            self.isHidden = false;
            self.autoAdjustHeightAndScrollbar();
            rings.style.display = ringsleft.style.display = ringsright.style.display = ringsresizing.style.display = "";
          }
        };

        var multiplier = ((event && event.shiftKey) ? 10 : 1); // enable slo-mo
        new AppleAnimator(500*multiplier, 13, 0, 1, handler).start();

      }, 600
    );
  }

  // resizing
  var growboxInset;
  this.widgetStandardSize = {
    w: 240,
    h: 328
  }

  this.widgetSize = {
    w: PreferenceStore.preferenceForKey("lastWidth") || this.widgetStandardSize.w,
    h: (PreferenceStore.preferenceForKey("autoAdjustHeight") == true) ? this.widgetStandardSize.h : (PreferenceStore.preferenceForKey("lastHeight") || this.widgetStandardSize.h)
  }

  this.widgetMinSize = {
    w: 210,
    h: 210
  }

  this.widgetMaxSize = {
    w: 450,
    h: 564
  }

  this.startResizing = function(event) {
    document.onmousemove = function() { self.resize.apply(self, arguments); };
    document.onmouseup = function() { self.stopResizing.apply(self, arguments); };
    growboxInset = {x:(window.innerWidth - event.x), y:(window.innerHeight - event.y)};
    event.stopPropagation();
    event.preventDefault();
  }

  this.resize = function(event) {
    var w = event.x + growboxInset.x;
    var h = event.y + growboxInset.y;

    // min sizes
    if(h < this.widgetMinSize.h) h=this.widgetMinSize.h;
    if(w < this.widgetMinSize.w) w=this.widgetMinSize.w;
    // max sizes
    if(h > this.widgetMaxSize.h) h=this.widgetMaxSize.h;
    if(w > this.widgetMaxSize.w) w=this.widgetMaxSize.w;

    var ringswidth = parseInt((w-30)/20)*20;
    rings.style.width = ringswidth+"px";
    setRingsSidesToWidth((w-ringswidth-30)/2);

    if(PreferenceStore.preferenceForKey("autoAdjustHeight") == true)
      window.resizeTo(w,this.widgetSize.h);
    else
      window.resizeTo(w,h);

    event.stopPropagation();
    event.preventDefault();
  }

  var setRingsSidesToWidth = function(ringssideswidth) {
    if(ringssideswidth%parseInt(ringssideswidth) == 0.5 || ringssideswidth == 0.5) {
      ringsleft.style.width = parseInt(ringssideswidth)+"px";
      ringsright.style.width = (parseInt(ringssideswidth)+1)+"px";
    } else {
      ringsleft.style.width = ringsright.style.width = ringssideswidth+"px";
    }
  }

  this.stopResizing = function(event)
  {
    document.onmousemove = undefined;
    document.onmouseup = undefined;
    event.stopPropagation();
    event.preventDefault();
    PreferenceStore.setPreferenceForKey((this.widgetSize.w = window.innerWidth), "lastWidth");
    if(PreferenceStore.preferenceForKey("autoAdjustHeight") == false)
      PreferenceStore.setPreferenceForKey((this.widgetSize.h = window.innerHeight), "lastHeight");
    this.autoAdjustHeightAndScrollbar();
  }

  this.autoAdjustHeightAndScrollbar = function() {
    if(document.defaultView.getComputedStyle(this.front, null).getPropertyValue("visibility") == "hidden")
      return;

    this.autoAdjusting = true;

    // function to adjust width
    var adjustWidth = function() {
      var oldWidth = window.innerWidth;
      rings.style.display = ringsleft.style.display = ringsright.style.display = "none";
      ringsresizing.style.display = "block";

      var handler = function(animation, current, start, finish) {
        var w = oldWidth+(self.widgetSize.w-oldWidth)*current;

        window.resizeTo(
          w,
          window.innerHeight
        );

        if(current >= 1) {
          var ringswidth = parseInt((w-30)/20)*20;
          rings.style.width = ringswidth+"px";
          rings.style.display = ringsleft.style.display = ringsright.style.display = ringsresizing.style.display = list.style.display = "";
          setRingsSidesToWidth((w-ringswidth-30)/2);

          adjustHeight.apply(self);
        }
      };
      new AppleAnimator(500, 13, 0, 1, handler).start();
    }

    // function to adjust height
    var adjustHeight = function() {
      var i = -1, h = 0;
      var topAndBottom = 64;
      var paddingTop = parseInt(document.defaultView.getComputedStyle(Display.list, null).getPropertyValue("padding-top"));
      h+=topAndBottom+paddingTop;

      // hide scrollbar to calculate the total height.
      // If the height is bigger than the allowed height, then adjust scrollbar and height.
      var hidden;
      if((hidden = this.scrollArea._scrollbars[0].hidden) == false) {
        this.scrollArea._scrollbars[0].hide();
        this.list.display = "none";
        this.list.display = "";
      }

      var refreshScrollArea = !hidden;

      while(++i < this.list.childNodes.length) {
        h+= parseFloat(document.defaultView.getComputedStyle(this.list.childNodes[i], '').getPropertyValue("height"));
        if(h > this.widgetMaxSize.h) {
          h = this.widgetMaxSize.h;
          this.scrollArea._scrollbars[0].show();
          this.list.display = "none";
          this.list.display = "";
          refreshScrollArea = true;
          break;
        }
      }

      if(h < this.widgetMinSize.h) h = this.widgetMinSize.h;

      if(this.isHidden == false) {
        var oldH = window.innerHeight;
        this.widgetSize.h = h;
        if(oldH == h) {
          if(refreshScrollArea == true)
            this.scrollArea.refresh();
        };

        var handler = function(animation, current, start, finish) {

          window.resizeTo(
            window.innerWidth,
            oldH+(h-oldH)*current
          );

          if(current >= 1) {
            if(refreshScrollArea == true)
              self.scrollArea.refresh();
            if(Navigation.selectedTasks.length == 1)
              document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
            self.autoAdjusting = false;
          }
        };
        new AppleAnimator(500, 13, 0, 1, handler).start();
        return;
      } else {
        window.resizeTo(window.innerWidth, h);
        if(refreshScrollArea == true) {
          this.scrollArea.refresh();
        }
        if(Navigation.selectedTasks.length == 1)
          document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
      }

      this.autoAdjusting = false;
    }


    if(PreferenceStore.preferenceForKey("autoAdjustHeight") == true) {
      if(window.innerWidth != this.widgetSize.w && this.isHidden == false) {
        adjustWidth.apply(this);
        return;
      } else {
        window.resizeTo(this.widgetSize.w, window.innerHeight);
        adjustHeight.apply(this);
        return;
      }
    } else {
      this.scrollArea.refresh();
      if(Navigation.selectedTasks.length == 1)
        document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
    }

    this.autoAdjusting = false;
/*    /////////////////////////////////////////////

    if(PreferenceStore.preferenceForKey("autoAdjustHeight") == true) {
      var i = -1, h = 0;

      var topAndBottom = 64;
      var paddingTop = parseInt(document.defaultView.getComputedStyle(Display.list, null).getPropertyValue("padding-top"));

      h+=topAndBottom+paddingTop;

      // hide scrollbar to calculate the total height.
      // If the height is bigger than the allowed height, then adjust scrollbar and height.
      var hidden;
      if((hidden = this.scrollArea._scrollbars[0].hidden) == false) {
        this.scrollArea._scrollbars[0].hide();
        this.list.display = "none";
        this.list.display = "";
      }

      var refreshScrollArea = !hidden;

      while(++i < this.list.childNodes.length) {
        h+= parseFloat(document.defaultView.getComputedStyle(this.list.childNodes[i], '').getPropertyValue("height"));
        if(h > this.widgetMaxSize.h) {
          h = this.widgetMaxSize.h;
          this.scrollArea._scrollbars[0].show();
          this.list.display = "none";
          this.list.display = "";
          refreshScrollArea = true;
          break;

      if(h < this.widgetMinSize.h) h = this.widgetMinSize.h;

      if(document.defaultView.getComputedStyle(this.front, null).getPropertyValue("visibility") == "hidden") {
        this.widgetSize.h = h;
        if(Navigation.selectedTasks.length == 1)
          document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
      } else if(this.isHidden == false) {
        var oldH = this.widgetSize.h;
        this.widgetSize.h = h;
        var oldW = window.innerWidth;
        if(oldH == h) {
          if(refreshScrollArea == true)
            this.scrollArea.refresh();
        };

        if(oldW != self.widgetSize.w) {
          rings.style.display = ringsleft.style.display = ringsright.style.display = "none";
          ringsresizing.style.display = "block";
        }

        var handler = function(animation, current, start, finish) {
          var w = (oldW == self.widgetSize.w) ? oldW : oldW+(self.widgetSize.w-oldW)*current;

          window.resizeTo(
            w,
            oldH+(h-oldH)*current
          );

          if(current >= 1) {
            if(Navigation.selectedTasks.length == 1)
              document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
            if(refreshScrollArea == true)
              self.scrollArea.refresh();
            if(oldW != self.widgetSize.w) {
              var ringswidth = parseInt((w-30)/20)*20;
              rings.style.width = ringswidth+"px";
              rings.style.display = ringsleft.style.display = ringsright.style.display = ringsresizing.style.display = list.style.display = "";
              setRingsSidesToWidth((w-ringswidth-30)/2);
            }
          }
        };
        new AppleAnimator(500, 13, 0, 1, handler).start();
      } else {
        window.resizeTo(this.widgetSize.w, h);
        if(Navigation.selectedTasks.length == 1)
          document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
        if(refreshScrollArea == true) {
          this.scrollArea.refresh();
        }
      }
    } else {
      if(Navigation.selectedTasks.length == 1)
        document.getElementById(Navigation.selectedTasks[0]).scrollIntoViewIfNeeded();
      this.scrollArea.refresh();
    }*/
  }

  window.addEventListener("load", function() { initialize.apply(self); }, false);
})();

// Overwrite these methods to adjust the content size whether the scrollbar is shown or not
AppleScrollbar.prototype.hide = function()
{
  //this.scrollbar.style.display = "none";
  this.scrollbar.style.visibility = "hidden";
  this.hidden = true;
  if(!Display.list) return;
  Display.list.removeAttribute("scrollbar");
}

AppleScrollbar.prototype.show = function()
{
  //this.scrollbar.style.display = "block";
  this.scrollbar.style.visibility = "";
  this.hidden = false;
  if(!Display.list) return;
  Display.list.setAttribute("scrollbar", "true");
}
