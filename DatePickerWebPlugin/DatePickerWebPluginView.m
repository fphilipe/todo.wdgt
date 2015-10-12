//
//  DatePickerWebPluginView.m
//  DatePickerWebPlugin
//
//  Created by Philipe on 11.05.08.
//  Copyright __MyCompanyName__ 2008. All rights reserved.
//

#import "DatePickerWebPluginView.h"


@interface DatePickerWebPluginView (Internal)
- (id)_initWithArguments:(NSDictionary *)arguments;
@end

@implementation DatePickerWebPluginView

// WebPlugInViewFactory protocol
// The principal class of the plug-in bundle must implement this protocol.

+ (NSView *)plugInViewWithArguments:(NSDictionary *)newArguments
{
    return [[[self alloc] _initWithArguments:newArguments] autorelease];
}

- (void)webPlugInDestroy
{
    [container release];
}

- (id)objectForWebScript
{
    return self;
}

- (void)setToday {
    [self setDateValue:[NSDate dateWithNaturalLanguageString:@"today"]];
}

- (void)setFocus {
    [[self window] makeFirstResponder:self];
}

- (NSDate *)dateValue {
    return [super dateValue];
}

- (void)setDateValue:(NSDate *)value {
    [super setDateValue:value];
}

+ (NSString *)webScriptNameForSelector:(SEL)selector {
//    if(selector == @selector(setValue:)) {
//        return @"setValue";
//    }

    if(selector == @selector(setDateValue:)) {
        return @"setDateValue";
    }
    return nil;
}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)selector {
//    if(selector == @selector(setValue:)) {
//        return NO;
//    }
//
//    if(selector == @selector(value)) {
//        return NO;
    //    }

    if(selector == @selector(setToday)) {
        return NO;
    }

    if(selector == @selector(setFocus)) {
        return NO;
    }

    if(selector == @selector(setDateValue:)) {
        return NO;
    }

    if(selector == @selector(dateValue)) {
        return NO;
    }

    return YES;
}

- (void)drawRect:(NSRect)rect {
    NSSize lastSize = [[self cell] cellSize];

    // round the values
    lastSize.width=ceilf(lastSize.width);
    lastSize.height=ceilf(lastSize.height);

    if(!NSEqualSizes(lastSize, rect.size)) {
        // Adjust size to minimum
        [[self cell] calcDrawInfo:rect];

        // set the size
        [self setFrameSize:lastSize];
        [container setValue:[NSString stringWithFormat:@"%d", (int)ceilf(lastSize.width)] forKey:@"width"];
        [container setValue:[NSString stringWithFormat:@"%d", (int)ceilf(lastSize.height)] forKey:@"height"];
    }

    [super drawRect:rect];
}

@end

@implementation DatePickerWebPluginView (Internal)

- (id)_initWithArguments:(NSDictionary *)newArguments
{
    if ((self = [super initWithFrame:NSZeroRect])) {
        [self setDatePickerStyle:NSTextFieldAndStepperDatePickerStyle];
        [self setDatePickerElements:NSYearMonthDayDatePickerElementFlag];
        [self setDrawsBackground:YES];
        [[self cell] setControlSize:NSSmallControlSize];
        [[self cell] setFont:[NSFont systemFontOfSize:[NSFont systemFontSizeForControlSize:NSSmallControlSize]]];

        container = [[newArguments valueForKey:@"WebPlugInContainingElementKey"] retain];
    }

    return self;
}

@end
