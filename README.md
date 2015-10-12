<center><h1><img src='http://todo.philipefatio.com/css/img/head.png' alt='To Do Widget' /></center>

This is a widget for OS X Dashboard, originally released in December 2007. You
can see some screenshots at
[todo.philipefatio.com](http://todo.philipefatio.com).

It used to work quite well until Apple introduced iCloud, which drastically
changed how calendars and tasks are stored. I've open sourced it in case someone
wants to take a shot at it. I won't since I no longer use the Dashboard.

## Architecture

The widget consists of three parts:

-   The widget UI, made with HTML, CSS, and JavaScript.
-   An Objective-C plugin that acts as a bridge between JavaScript and the
    system-wide calendar store.
-   An Objective-C web-plugin, making the system date picker available in HTML.

## Author

Philipe Fatio ([@fphilipe](https://twitter.com/))

## License

MIT License. Copyright 2007 Philipe Fatio
