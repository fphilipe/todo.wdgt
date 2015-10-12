/*
 *  TaskComparison.h
 *  ToDoPlugin
 *
 *  Created by Philipe on 14.05.08.
 *  Copyright 2008 __MyCompanyName__. All rights reserved.
 *
 */

#import <Cocoa/Cocoa.h>
#import <CalendarStore/CalendarStore.h>

NSInteger compareTasks(CalTask *task1, CalTask *task2, void *context);

NSInteger compareTasksByDueDate(CalTask *task1, CalTask *task2);
NSInteger compareTasksByPriority(CalTask *task1, CalTask *task2);
NSInteger compareTasksByCalendar(CalTask *task1, CalTask *task2);
NSInteger compareTasksByCompleteness(CalTask *task1, CalTask *task2);
NSInteger compareTasksByTitle(CalTask *task1, CalTask *task2);