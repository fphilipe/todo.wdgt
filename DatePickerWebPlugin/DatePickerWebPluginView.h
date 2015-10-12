//
//  DatePickerWebPluginView.h
//  DatePickerWebPlugin
//
//  Created by Philipe on 11.05.08.
//  Copyright __MyCompanyName__ 2008. All rights reserved.
//

#import <Cocoa/Cocoa.h>


@interface DatePickerWebPluginView : NSDatePicker <WebPlugInViewFactory>
{
    DOMHTMLObjectElement *container;
}

- (void)setToday;
- (void)setFocus;

@end
