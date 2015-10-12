/*
 *  TaskComparison.c
 *  ToDoPlugin
 *
 *  Created by Philipe on 14.05.08.
 *  Copyright 2008 __MyCompanyName__. All rights reserved.
 *
 */

#include "TaskComparison.h"

NSInteger compareTasks(CalTask *task1, CalTask *task2, void *context) {
    NSString *sortKey = (NSString *)context;

    NSInteger result = NSOrderedSame;

    // dueDate - completeness - priority - calendar - title
    if([sortKey isEqualToString:@"dueDate"]) {

        result = compareTasksByDueDate(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByCompleteness(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByPriority(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByCalendar(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByTitle(task1, task2);
    }

    // priority - due date - completeness - calendar - title
    else if([sortKey isEqualToString:@"priority"]) {

        result = compareTasksByPriority(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByDueDate(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByCompleteness(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByCalendar(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByTitle(task1, task2);
    }

    // calendar - completeness - due date - priority - title
    else if([sortKey isEqualToString:@"calendar"]) {

        result = compareTasksByCalendar(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByCompleteness(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByDueDate(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByPriority(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByTitle(task1, task2);
    }

    // completeness - due date - priority - title
    else if([sortKey isEqualToString:@"completeness"]) {

        result = compareTasksByCompleteness(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByDueDate(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByPriority(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByTitle(task1, task2);
    }

    // title - due date - priority - completeness
    else if([sortKey isEqualToString:@"title"]) {

        result = compareTasksByTitle(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByDueDate(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByPriority(task1, task2);

        if(result == NSOrderedSame)
            result = compareTasksByCompleteness(task1, task2);
    }

    return result;
}

NSInteger compareTasksByDueDate(CalTask *task1, CalTask *task2) {
    NSInteger result = NSOrderedSame;

    // treat completed tasks as tasks without due date
    NSDate *date1 = /*(task1.isCompleted) ? nil :*/ task1.dueDate;
    NSDate *date2 = /*(task2.isCompleted) ? nil :*/ task2.dueDate;

    if(!date1 && date2)
        result = NSOrderedDescending;
    else if(date1 && !date2)
        result = NSOrderedAscending;
    else
        result = [date1 compare:date2];

    return result;
}

NSInteger compareTasksByPriority(CalTask *task1, CalTask *task2) {
    NSInteger result = NSOrderedSame;

    if(task1.priority == 0 && task2.priority != 0)
        result = NSOrderedDescending;
    else if(task1.priority != 0 && task2.priority == 0)
        result = NSOrderedAscending;
    else if(task1.priority > task2.priority)
        result = NSOrderedDescending;
    else if(task1.priority < task2.priority)
        result = NSOrderedAscending;
    return result;
}

NSInteger compareTasksByCalendar(CalTask *task1, CalTask *task2) {
    return [task1.calendar.title caseInsensitiveCompare:task2.calendar.title];
}

NSInteger compareTasksByCompleteness(CalTask *task1, CalTask *task2) {
    NSInteger result = NSOrderedSame;

    if(task1.isCompleted < task2.isCompleted)
        result = NSOrderedAscending;
    else if(task1.isCompleted > task2.isCompleted)
        result = NSOrderedDescending;

    return result;
}

NSInteger compareTasksByTitle(CalTask *task1, CalTask *task2) {
    return [task1.title caseInsensitiveCompare:task2.title];
}
