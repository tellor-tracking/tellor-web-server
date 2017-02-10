# Description

This service can recount event hits that have already happened. By default tellor
counts events at the moment event is registered. But there are instances where you may want
to recount events after they have been registered: user added new filter, user modified filter.

The recalculation of all events can take a while depending on number of events that exist for
particular app. It is time and resource intensive, so this is implemented as as service. 
This service can and should be run on separate machine.


# Possible usecases

 * Filter value updated
 * New filter added
 * Group up segmentation key values into one (so if i have 10 **fa** and 10 **fu** grouped
 would be 20 **new name**)
