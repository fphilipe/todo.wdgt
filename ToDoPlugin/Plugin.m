//
//  Plugin.m
//  ToDoPlugin
//
//  Created by Philipe on 09.01.08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import "Plugin.h"
#import "TaskComparison.h"

@interface Plugin (Private)

- (NSArray *)arrayWithCalendar:(CalCalendar *)calendar;
- (NSArray *)arrayWithTask:(CalTask *)task;
- (void)loadAndSortTasks;
- (BOOL)willTaskBeShown:(CalTask *)task;
- (NSUInteger)indexOfTaskWithUID:(NSString *)uid;
- (void)sortTasks;

@end

@implementation Plugin

#pragma mark -
#pragma mark WebKit

- (id)initWithWebView:(WebView*)webView
{
    self = [super init];
    if (self != nil) {
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(tasksChanged:)
                                                     name:CalTasksChangedExternallyNotification
                                                   object:[CalCalendarStore defaultCalendarStore]];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(tasksChanged:)
                                                     name:CalTasksChangedNotification
                                                   object:[CalCalendarStore defaultCalendarStore]];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(calendarsChanged:)
                                                     name:CalCalendarsChangedExternallyNotification
                                                   object:[CalCalendarStore defaultCalendarStore]];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(calendarsChanged:)
                                                     name:CalCalendarsChangedNotification
                                                   object:[CalCalendarStore defaultCalendarStore]];
    }

    return self;
}

- (void)windowScriptObjectAvailable:(WebScriptObject *)windowScriptObject
{
    scriptObject = windowScriptObject;
    [scriptObject setValue:self forKey:@"Plugin"];

    // set the uid for this widget
    [scriptObject evaluateWebScript:@"if(!widget.preferenceForKey('widgetuid')) widget.setPreferenceForKey(((Math.random()+'').substr(2,100)+(Math.random()+'').substr(2,100)+(Math.random()+'').substr(2,100)).substr(0,32), 'widgetuid');"];
}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSel
{
    if(aSel == @selector(checkForUpdate) ||
       aSel == @selector(openURL:) ||
       aSel == @selector(openRelativeURL:) ||
       aSel == @selector(calendars) ||
       aSel == @selector(createCalendarWithTitle:) ||
       aSel == @selector(tasks) ||
       aSel == @selector(removeTaskWithUID:) ||
       aSel == @selector(createTaskInCalendarWithUID:) ||
       aSel == @selector(toggleCompletenessForTaskWithUID:) ||
       aSel == @selector(setPriority:forTaskWithUID:) ||
       aSel == @selector(setTitle:forTaskWithUID:) ||
       aSel == @selector(indexOfTaskWithUID:) ||
       aSel == @selector(setNotes:URL:dueDate:forTaskWithUID:) ||
       aSel == @selector(dueDateForTaskWithUID:))
        return NO;
    else
        return YES;
}

+ (NSString*)webScriptNameForSelector:(SEL)aSel
{
    // update
    if(aSel == @selector(checkForUpdate))
        return @"checkForUpdate";

    // url
    if(aSel == @selector(openURL:))
        return @"openURL";
    if(aSel == @selector(openRelativeURL:))
        return @"openRelativeURL";

    // calendars
    if(aSel == @selector(calendars))
        return @"calendars";
    if(aSel == @selector(createCalendarWithTitle:))
        return @"createCalendarWithTitle";

    // tasks
    if(aSel == @selector(tasks))
        return @"tasks";
    if(aSel == @selector(removeTaskWithUID:))
        return @"removeTaskWithUID";
    if(aSel == @selector(createTaskInCalendarWithUID:))
        return @"createTaskInCalendarWithUID";
    if(aSel == @selector(toggleCompletenessForTaskWithUID:))
        return @"toggleCompletenessForTaskWithUID";
    if(aSel == @selector(setPriority:forTaskWithUID:))
        return @"setPriorityForTaskWithUID";
    if(aSel == @selector(setTitle:forTaskWithUID:))
        return @"setTitleForTaskWithUID";
    if(aSel == @selector(setNotes:URL:dueDate:forTaskWithUID:))
        return @"setNotesAndURLAndDueDateForTaskWithUID";
    if(aSel == @selector(dueDateForTaskWithUID:))
        return @"dueDateForTaskWithUID";

    // other
    if(aSel == @selector(indexOfTaskWithUID:))
        return @"indexOfTaskWithUID";

    return nil;
}

#pragma mark -
#pragma mark Update

- (void)checkForUpdate {
    // if the update notification is shown, do nothin
    if([[scriptObject evaluateWebScript:@"HUD.shownHUD !== 'updateInformation'"] boolValue]) {
        NSString *versionStr = [[[NSBundle bundleWithPath:[[[NSBundle bundleForClass:[self class]] bundlePath] stringByDeletingLastPathComponent]] infoDictionary] objectForKey:@"CFBundleVersion"];
        NSString *uid = [scriptObject evaluateWebScript:@"widget.preferenceForKey('widgetuid')"];
        NSArray *thisVersion = [versionStr componentsSeparatedByString:@"."];
        NSString *newestVersionString = [NSString stringWithContentsOfURL:[NSURL URLWithString:[(NSString *)[scriptObject evaluateWebScript:@"PreferenceStore.URLs.version"] stringByAppendingFormat:@"?uid=%@&version=%@", uid, versionStr]] encoding:NSUTF8StringEncoding error:NULL];
        if(newestVersionString && thisVersion) {
            NSArray *newestVersion = [newestVersionString componentsSeparatedByString:@"."];
            NSUInteger limit = ([newestVersion count] < [thisVersion count]) ? [newestVersion count] : [thisVersion count];
            BOOL needUpdate = NO;

            NSUInteger i;
            for (i = 0; i < limit; i++) {
                if([[newestVersion objectAtIndex:i] integerValue] > [[thisVersion objectAtIndex:i] integerValue]) {
                    needUpdate = YES;
                    break;
                } else if([[newestVersion objectAtIndex:i] integerValue] < [[thisVersion objectAtIndex:i] integerValue]) {
                    break;
                }
                if(i == limit-1 && [newestVersion count] > limit && [[newestVersion objectAtIndex:i] integerValue] == [[thisVersion objectAtIndex:i] integerValue])
                    needUpdate = YES;
            }

            if(needUpdate) {
                [[scriptObject valueForKey:@"HUD"] callWebScriptMethod:@"showUpdateInformation" withArguments:[NSArray arrayWithObjects:versionStr, newestVersionString, nil]];
            }
        }
    }
    [self performSelector:@selector(checkForUpdate) withObject:nil afterDelay:60*60*24];
}

#pragma mark -
#pragma mark URL Opening

- (BOOL)openURL:(NSString *)url {
    return [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:url]];
}

- (BOOL)openRelativeURL:(NSString *)url {
    NSString *absoluteURL = [[[[NSBundle bundleForClass:[self class]] bundlePath] stringByDeletingLastPathComponent] stringByAppendingPathComponent:url];
    return [[NSWorkspace sharedWorkspace] openURL:[NSURL fileURLWithPath:absoluteURL]];
}

#pragma mark -
#pragma mark Calendars

- (NSArray *)calendars {
    NSArray *calendars = [[CalCalendarStore defaultCalendarStore] calendars];
    NSMutableArray *calendarsAsArrays = [NSMutableArray array];
    CalCalendar *calendar;
    for (calendar in calendars) {
        [calendarsAsArrays addObject:[self arrayWithCalendar:calendar]];
    }
    return calendarsAsArrays;
}

// observation

- (void)calendarsChanged:(NSNotification *)notification {
    WebScriptObject *JSCalendarStore = [scriptObject valueForKey:@"CalendarStore"];

    NSString *calendarUID;

    // Apply delete changes
    NSArray *deletedRecords = [[notification userInfo] valueForKey:CalDeletedRecordsKey];
    if (deletedRecords != nil) {
        [JSCalendarStore callWebScriptMethod:@"_removeCalendars" withArguments:[NSArray arrayWithObject:deletedRecords]];
    }

    // Apply insert changes
    NSArray *insertedRecords = [[notification userInfo] valueForKey:CalInsertedRecordsKey];
    if (insertedRecords != nil) {
        NSMutableArray *insertedCalendars;
        // get the calendars
        insertedCalendars = [NSMutableArray array];
        for(calendarUID in insertedRecords) {
            [insertedCalendars addObject:[self arrayWithCalendar:[[CalCalendarStore defaultCalendarStore] calendarWithUID:calendarUID]]];
        }

        [JSCalendarStore callWebScriptMethod:@"_addCalendars" withArguments:[NSArray arrayWithObject:insertedCalendars]];
    }

    // Apply update changes
    NSArray *updatedRecords = [[notification userInfo] valueForKey:CalUpdatedRecordsKey];
    if (updatedRecords != nil) {
        NSMutableArray *updatedCalendars;
        // get the calendars
        updatedCalendars = [NSMutableArray array];
        for(calendarUID in updatedRecords) {
            [updatedCalendars addObject:[self arrayWithCalendar:[[CalCalendarStore defaultCalendarStore] calendarWithUID:calendarUID]]];
        }
        [JSCalendarStore callWebScriptMethod:@"_updateCalendars" withArguments:[NSArray arrayWithObject:updatedCalendars]];
    }
}

- (NSString *)createCalendarWithTitle:(NSString *)title {
    CalCalendar *newCalendar = [CalCalendar calendar];
    newCalendar.title = title;

    NSString *returnValue = nil;
    if([[CalCalendarStore defaultCalendarStore] saveCalendar:newCalendar error:NULL])
        returnValue = newCalendar.uid;

    return returnValue;
}

#pragma mark -
#pragma mark Tasks

- (NSArray *)tasks {
    [self loadAndSortTasks];

    NSMutableArray *tasksAsArrays = [NSMutableArray arrayWithCapacity:[tasksToShow count]];

    CalTask *task;
    for (task in tasksToShow) {
        [tasksAsArrays addObject:[self arrayWithTask:task]];
    }
    return tasksAsArrays;
}

- (BOOL)removeTaskWithUID:(NSString *)uid {
    CalTask *task = [[CalCalendarStore defaultCalendarStore] taskWithUID:uid];
    return [[CalCalendarStore defaultCalendarStore] removeTask:task error:nil];
}

- (void)tasksChanged:(NSNotification *)notification {
    WebScriptObject *JSTaskStore = [scriptObject valueForKey:@"TaskStore"];

    NSString *taskUID;
    CalTask *task;
    NSUInteger index;
    NSMutableArray *insertedTasks = nil;
    NSMutableArray *updatedTasks = nil;


    NSMutableArray *deletedRecords  = [[[notification userInfo] valueForKey:CalDeletedRecordsKey]  mutableCopy];
    if(deletedRecords == nil) deletedRecords = [NSMutableArray array];
    NSMutableArray *insertedRecords = [[[notification userInfo] valueForKey:CalInsertedRecordsKey] mutableCopy];
    if(insertedRecords == nil) insertedRecords = [NSMutableArray array];
    NSMutableArray *updatedRecords  = [[[notification userInfo] valueForKey:CalUpdatedRecordsKey]  mutableCopy];
    if(updatedRecords == nil) updatedRecords = [NSMutableArray array];

    // Apply update changes
    if ([updatedRecords count] > 0) {
        // get the tasks
        updatedTasks = [NSMutableArray array];
        CalTask *oldTask;
        for(taskUID in updatedRecords) {
            task = [[CalCalendarStore defaultCalendarStore] taskWithUID:taskUID];
            // modification of a task can result in 3 different consequences:
            // 1. it is shown but it will no longer be shown: add it to delete records
            if([self indexOfTaskWithUID:task.uid] != NSNotFound && ![self willTaskBeShown:task])
                [deletedRecords addObject:task.uid];
            // 2. it is not shown but will now be visible: add it to insert records
            if([self indexOfTaskWithUID:task.uid] == NSNotFound && [self willTaskBeShown:task])
                [insertedRecords addObject:task.uid];
            // 3. it is shown and it still will be visible
            if((index = [self indexOfTaskWithUID:task.uid]) != NSNotFound && [self willTaskBeShown:task]) {
                oldTask = [tasksToShow objectAtIndex:[self indexOfTaskWithUID:task.uid]];
                [tasksToShow replaceObjectAtIndex:index withObject:task];
                [updatedTasks addObject:[self arrayWithTask:task]];
            }
        }
    }


    if([insertedRecords count] > 0) {
        // get the tasks
        insertedTasks = [NSMutableArray array];
        for(taskUID in insertedRecords) {
            task = [[CalCalendarStore defaultCalendarStore] taskWithUID:taskUID];
            if([self willTaskBeShown:task]) {
                [tasksToShow addObject:task];
                [insertedTasks addObject:[self arrayWithTask:task]];
            }
        }
    }

    if([deletedRecords count] > 0) {
        NSMutableArray *actualDeletedRecords = [deletedRecords mutableCopy];
        for(taskUID in deletedRecords) {
            if((index = [self indexOfTaskWithUID:taskUID]) == NSNotFound) {
                [actualDeletedRecords removeObject:taskUID];
            } else {
                [tasksToShow removeObjectAtIndex:index];
            }
        }
        deletedRecords = actualDeletedRecords;
    }

    if((updatedTasks != nil && [updatedTasks count] > 0) ||
       (insertedTasks != nil && [insertedTasks count] > 0))
        [self sortTasks];

    // apply changes
    if(updatedTasks != nil && [updatedTasks count] > 0)
        [JSTaskStore callWebScriptMethod:@"_updateTasks" withArguments:[NSArray arrayWithObject:updatedTasks]];

    if(insertedTasks != nil && [insertedTasks count] > 0)
        [JSTaskStore callWebScriptMethod:@"_addTasks" withArguments:[NSArray arrayWithObject:insertedTasks]];

    if([deletedRecords count] > 0)
        [JSTaskStore callWebScriptMethod:@"_removeTasks" withArguments:[NSArray arrayWithObject:deletedRecords]];
}

- (BOOL)createTaskInCalendarWithUID:(NSString *)uid {
    CalCalendar *calendar = [[CalCalendarStore defaultCalendarStore] calendarWithUID:uid];
    if(calendar != nil) {
        CalTask *task = [CalTask task];
        task.calendar = calendar;
        task.title = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('New To Do');"];
        [[scriptObject valueForKey:@"Navigation"] setValue:task.uid forKey:@"newTaskToSelect"];
        return [[CalCalendarStore defaultCalendarStore] saveTask:task error:nil];
    }
    return NO;
}

- (BOOL)toggleCompletenessForTaskWithUID:(NSString *)uid {
    CalTask *task = [[CalCalendarStore defaultCalendarStore] taskWithUID:uid];
    if(!task) return NO;
    task.isCompleted = (BOOL)(abs(task.isCompleted-1));
    return [[CalCalendarStore defaultCalendarStore] saveTask:task error:nil];
}

- (BOOL)setPriority:(NSNumber *)priority forTaskWithUID:(NSString *)uid
{
    CalTask *task = [[CalCalendarStore defaultCalendarStore] taskWithUID:uid];
    if(!task) return NO;
    task.priority = [priority intValue];
    return [[CalCalendarStore defaultCalendarStore] saveTask:task error:nil];
}

- (BOOL)setTitle:(NSString *)title forTaskWithUID:(NSString *)uid
{
    CalTask *task = [[CalCalendarStore defaultCalendarStore] taskWithUID:uid];
    if(!task) return NO;
    task.title = title;
    return [[CalCalendarStore defaultCalendarStore] saveTask:task error:nil];
}

- (BOOL)setNotes:(NSString *)notes URL:(NSString *)url dueDate:(NSDate *)dueDate forTaskWithUID:(NSString *)uid {
    CalTask *task = [[CalCalendarStore defaultCalendarStore] taskWithUID:uid];
    if(!task) return NO;

    task.notes = ([notes isEqualToString:@""]) ? nil : notes;
    task.url = ([url isEqualToString:@""]) ? nil : [NSURL URLWithString:url];
    task.dueDate = (dueDate) ? dueDate : nil;

    return [[CalCalendarStore defaultCalendarStore] saveTask:task error:nil];
}

- (NSDate *)dueDateForTaskWithUID:(NSString *)uid {
    CalTask *task = [[CalCalendarStore defaultCalendarStore] taskWithUID:uid];
    return task.dueDate;
}

@end

#pragma mark -
#pragma mark Private Methods

@implementation Plugin (Private)

- (NSArray *)arrayWithCalendar:(CalCalendar *)calendar
{
    CGFloat red, green, blue;
    [[calendar.color colorUsingColorSpaceName:NSCalibratedRGBColorSpace] getRed:&red green:&green blue:&blue alpha:NULL];
    return [NSArray arrayWithObjects:
            calendar.uid,
            calendar.title,
            [NSNumber numberWithBool:calendar.isEditable],
            [NSNumber numberWithFloat:255.0*red],
            [NSNumber numberWithFloat:255.0*green],
            [NSNumber numberWithFloat:255.0*blue],
            nil
    ];
}

- (NSArray *)arrayWithTask:(CalTask *)task
{
    NSDate *today;
    NSDate *yesterday;
    NSDate *tomorrow;
    NSTimeInterval oneDay;
    NSDateFormatter *dateFormat;

    if(task.dueDate || task.completedDate) {
        oneDay = 60*60*24;
        today = [NSDate dateWithNaturalLanguageString:@"today"];
        yesterday = [[NSDate alloc] initWithTimeInterval:-oneDay sinceDate:today];
        tomorrow = [[NSDate alloc] initWithTimeInterval:oneDay sinceDate:today];

        dateFormat = [[NSDateFormatter alloc] init];
        [dateFormat setDateStyle:NSDateFormatterFullStyle];
    }

    id dueDate;
    if(task.dueDate) {
        if([task.dueDate timeIntervalSinceDate:today] < oneDay && [task.dueDate timeIntervalSinceDate:today] >= 0) { // today
            dueDate = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('Today');"];
        } else if([task.dueDate timeIntervalSinceDate:yesterday] < oneDay && [task.dueDate timeIntervalSinceDate:yesterday] >= 0) { // yestarday
            dueDate = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('Yesterday');"];
        } else if([task.dueDate timeIntervalSinceDate:tomorrow] < oneDay && [task.dueDate timeIntervalSinceDate:tomorrow] >= 0) { // tomorrow
            dueDate = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('Tomorrow');"];
        } else
            dueDate = [NSString stringWithFormat:@"%@", [dateFormat stringFromDate:task.dueDate]];
    } else
        dueDate = [NSNumber numberWithBool:NO];

    id notes;
    if(task.notes)
        notes = task.notes;
    else
        notes = [NSNumber numberWithBool:NO];

    id url;
    if(task.url)
        url = [task.url absoluteString];
    else
        url = [NSNumber numberWithBool:NO];

    id completedDate;
    if(task.completedDate) {
        if([task.completedDate timeIntervalSinceDate:today] < oneDay && [task.completedDate timeIntervalSinceDate:today] >= 0) { // today
            completedDate = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('Today');"];
        } else if([task.completedDate timeIntervalSinceDate:yesterday] < oneDay && [task.completedDate timeIntervalSinceDate:yesterday] >= 0) { // yestarday
            completedDate = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('Yesterday');"];
        } else if([task.completedDate timeIntervalSinceDate:tomorrow] < oneDay && [task.completedDate timeIntervalSinceDate:tomorrow] >= 0) { // tomorrow
            completedDate = [scriptObject evaluateWebScript:@"Localization.localizedStringForKey('Tomorrow');"];
        } else
            completedDate = [NSString stringWithFormat:@"%@", [dateFormat stringFromDate:task.completedDate]];
    } else
        completedDate = [NSNumber numberWithBool:NO];

    return [NSArray arrayWithObjects:
            task.uid,
            task.title,
            dueDate,
            notes,
            [NSNumber numberWithInt:task.priority],
            url,
            [NSNumber numberWithBool:task.isCompleted],
            completedDate,
            ([[NSDate date] timeIntervalSinceDate:task.dueDate] >= 0) ? [NSNumber numberWithBool:YES] : [NSNumber numberWithBool:NO],
            task.calendar.uid,
            nil
            ];
}

- (void)loadAndSortTasks {
    // if no calendar is specified we use all
    NSString *uid = [scriptObject evaluateWebScript:@"PreferenceStore.preferenceForKey('selectedCalendar') || 'all'"];
    NSArray *calendars;
    if(uid == @"all" || [[CalCalendarStore defaultCalendarStore] calendarWithUID:uid] == nil)
        calendars = [[CalCalendarStore defaultCalendarStore] calendars];
    else
        calendars = [NSArray arrayWithObject:[[CalCalendarStore defaultCalendarStore] calendarWithUID:uid]];

    /* PREDICATE:
     * ----------
     * Distinguish 3 possible options:
     * 1. Only uncompleted tasks are shown.
     * 2. Completed and uncompleted tasks are shown.
     * 3. Uncompleted and completed since a specific time frame.
     */
    BOOL showCompletedTasks = [(NSNumber *)[scriptObject evaluateWebScript:@"(function() { var ret = PreferenceStore.preferenceForKey('showCompletedTasks'); return (ret == undefined) ? true : ret; })()"] boolValue];
    BOOL limitCompletedTasks = [(NSNumber *)[scriptObject evaluateWebScript:@"(function() { var ret = PreferenceStore.preferenceForKey('limitCompletedTasks'); return (ret == undefined) ? false : ret; })()"] boolValue];
    int completedTasksLimitation = [(NSNumber *)[scriptObject evaluateWebScript:@"PreferenceStore.preferenceForKey('completedTasksLimitation') || 7"] intValue];

    NSTimeInterval oneDay = 60*60*24;
    NSDate *today = [NSDate dateWithNaturalLanguageString:@"today"];

    NSPredicate *predicate;

    // Case 1 and 3:
    if(showCompletedTasks == NO || (showCompletedTasks == YES && limitCompletedTasks == YES))
        predicate = [CalCalendarStore taskPredicateWithUncompletedTasks:calendars];
    // Case 2:
    else if(showCompletedTasks == YES && limitCompletedTasks == NO)
        predicate = [CalCalendarStore taskPredicateWithCalendars:calendars];

    tasksToShow = [[[CalCalendarStore defaultCalendarStore] tasksWithPredicate:predicate] mutableCopy];

    // Case 3 (just add the completed tasks in the timeframe):
    if(showCompletedTasks == YES && limitCompletedTasks == YES) {
        predicate = [CalCalendarStore taskPredicateWithTasksCompletedSince:[[NSDate alloc] initWithTimeInterval:-oneDay*completedTasksLimitation sinceDate:today] calendars:calendars];
        [tasksToShow addObjectsFromArray:[[CalCalendarStore defaultCalendarStore] tasksWithPredicate:predicate]];
    }

    [self sortTasks];
}

- (BOOL)willTaskBeShown:(CalTask *)task {
    NSString *selectedCalendar = (NSString *)[scriptObject evaluateWebScript:@"PreferenceStore.preferenceForKey('selectedCalendar') || 'all'"];

    if([selectedCalendar isEqualToString:task.calendar.uid] || [selectedCalendar isEqualToString:@"all"]) {
        BOOL showCompletedTasks = [(NSNumber *)[scriptObject evaluateWebScript:@"(function() { var ret = PreferenceStore.preferenceForKey('showCompletedTasks'); return (ret == undefined) ? true : ret; })()"] boolValue];
        BOOL limitCompletedTasks = [(NSNumber *)[scriptObject evaluateWebScript:@"(function() { var ret = PreferenceStore.preferenceForKey('limitCompletedTasks'); return (ret == undefined) ? false : ret; })()"] boolValue];
        if((showCompletedTasks && !limitCompletedTasks) || !task.isCompleted) {
            return YES;
        } else if(!showCompletedTasks && task.isCompleted) {
            return NO;
        } else if(showCompletedTasks && limitCompletedTasks) {
            int completedTasksLimitation = [(NSNumber *)[scriptObject evaluateWebScript:@"PreferenceStore.preferenceForKey('completedTasksLimitation') || 7"] intValue];
            NSDate *dateLimit = [[NSDate alloc] initWithTimeInterval:-(60*60*24)*completedTasksLimitation sinceDate:[NSDate dateWithNaturalLanguageString:@"today"]];
            if([task.completedDate compare:dateLimit] == NSOrderedAscending) {
                return NO;
            } else {
                return YES;
            }
        }
    }
    return NO;
}

- (NSUInteger)indexOfTaskWithUID:(NSString *)uid {
    for (CalTask *task in tasksToShow) {
        if([task.uid isEqualToString:uid])
            return [tasksToShow indexOfObject:task];
    }
    return NSNotFound;
}

- (void)sortTasks {
    NSString *sortKey = [scriptObject evaluateWebScript:@"PreferenceStore.preferenceForKey('sortKey') || 'dueDate';"];
    tasksToShow = [[tasksToShow sortedArrayUsingFunction:compareTasks context:sortKey] mutableCopy];
}

@end
