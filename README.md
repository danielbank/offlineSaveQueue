offlineSaveQueue
================

An HTML5 Local Storage Solution for Saving and Processing JSON Objects.


Usage
================
**Instantiate an OfflineSaveQueue object:**
var offlineSaveQueue = new OfflineSaveQueue();

**Set the callback function which is executed when the queue is processed:**
offlineSaveQueue.setCallback(function(objectInstance, objectName){//Do stuff here...});

**Start periodic queue processing:**
offlineSaveQueue.startQueueProcessing(60000);

**Stop periodic queue processing:**
offlineSaveQueue.stopQueueProcessing();

**Save an item into the queue**
offlineSaveQueue.saveObject({"foo": "bar"}, "DummyObject");

**Manually process the queue**
offlineSaveQueue.processQueue();

**Get the number of items in the queue:**
offlineSaveQueue.count()

Links
================


Credits
================
Copyright Daniel Bank (daniel.p.bank@gmail.com)
September 5th 2013
MIT License
https://github.com/danielbank/offlineSaveQueue/blob/master/LICENSE