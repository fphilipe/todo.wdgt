//
//  Plugin.h
//  ToDoPlugin
//
//  Created by Philipe on 09.01.08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import <CalendarStore/CalendarStore.h>

@interface Plugin : NSObject {
    WebScriptObject *scriptObject;
    NSMutableArray *tasksToShow;
}

#pragma mark -
#pragma mark Update

- (void)checkForUpdate;

#pragma mark -
#pragma mark URL Opening

- (BOOL)openURL:(NSString *)url;

#pragma mark -
#pragma mark Calendars

- (NSArray *)calendars;
- (void)calendarsChanged:(NSNotification *)notification;
- (NSString *)createCalendarWithTitle:(NSString *)title;

#pragma mark -
#pragma mark Tasks

- (NSArray *)tasks;
- (BOOL)removeTaskWithUID:(NSString *)uid;
- (void)tasksChanged:(NSNotification *)notification;
- (BOOL)createTaskInCalendarWithUID:(NSString *)uid;
- (BOOL)toggleCompletenessForTaskWithUID:(NSString *)uid;
- (BOOL)setPriority:(NSNumber *)priority forTaskWithUID:(NSString *)uid;
- (BOOL)setTitle:(NSString *)title forTaskWithUID:(NSString *)uid;
- (BOOL)setNotes:(NSString *)notes URL:(NSString *)url dueDate:(NSDate *)dueDate forTaskWithUID:(NSString *)uid;
- (NSDate *)dueDateForTaskWithUID:(NSString *)uid;

@end
