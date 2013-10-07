describe("OfflineSaveFunctionality", function() {
	/**************************************************************************************************************** 
	 *                                             VERY IMPORTANT NOTE!                                             *
	 * Be sure to provide your Parse Application Key and Parse JavaScript Key in the following two lines of code!   *
	 ****************************************************************************************************************/
	var ParseAppKey = "";
	var ParseJSKey = "";
	if(ParseAppKey === "" || ParseJSKey === ""){
		alert("This example will not work unless you set the Parse Application Key and Parse JavaScript Key on lines 6 and 7!");
	}

	// Initialize Parse
	Parse.initialize(ParseAppKey, ParseJSKey);

	// Test Variables
	var offlineSaveQueue;
	//var DummyParseObject;
	var dummyObject;
	
	beforeEach(function () {
		// Before each test, remove the queue from local storage
		window.localStorage.removeItem("offlineSaveQueue");
		
		// Initialize the OfflineSaveQueue
		offlineSaveQueue = new OfflineSaveQueue();
		// Set the callback for the OfflineSaveQueue
		offlineSaveQueue.setCallback(function(inputObjectInstance, inputObjectName){
			// Create a class equal to the Global Variable matching the inputObjectName string
			var parseClass = window[inputObjectName];
			// Instantiate a new Object of the class
			var parseObject = new parseClass();

			// Save the inputObjectInstance to Parse
			parseObject.save(inputObjectInstance, {
				error: function(parseObject, err){
					// TODO: Check the error code and only add the object back for non-fatal errors!
					// If there is an error, add the object back to the queue
					offlineSaveQueue.saveObject(inputObjectInstance, inputObjectName);
				}
			});
		});
		
		// Initialize the Test Variables
		DummyObject = Parse.Object.extend("DummyObject");
		dummyObject = {bar: "yes", barp: true, barg: 1};
		
		// Save the dummyObject variable in the queue with an objectName of "DummyObject"
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
	});

	describe("saveObject", function() {
	  it("correctly saves an Object to the queue", function() {
		// Parse the offlineSaveQueue for the first Object in the queue and check its objectInstance
		var arrayObj = JSON.parse(window.localStorage.getItem("offlineSaveQueue"))[0];
		var dummyObjInst = arrayObj.objectInstance;
		expect(dummyObjInst).toEqual(dummyObject);
	  });
		
	  it("correctly saves a class to the queue", function() {
		// Parse the offlineSaveQueue for the first Object in the queue and check its objectName
		var arrayObj = JSON.parse(window.localStorage.getItem("offlineSaveQueue"))[0];
		var dummyObjName = arrayObj.objectName;
		expect(dummyObjName).toBe("DummyObject");
	  });
		
	  it("gracefully does not save undefined Objects to the queue", function() {
		// Save an item with an undefined Object in the queue and check the length of the queue
		// Note there should be 1 item already in the queue from the beforeEach step
		var undefinedObject;
		offlineSaveQueue.saveObject(undefinedObject, "DummyObject");
		expect(JSON.parse(window.localStorage.getItem("offlineSaveQueue")).length).toBe(1);
	  });
		
	  it("gracefully does not save undefined classes to the queue", function() {
		// Save an item with an undefined objectName in the queue and check the length of the queue
		// Note there should be 1 item already in the queue from the beforeEach step
		var undefinedClass;
		offlineSaveQueue.saveObject(dummyObject, undefinedClass);
		expect(JSON.parse(window.localStorage.getItem("offlineSaveQueue")).length).toBe(1);
	  });
		
	  it("can save at least 4 Objects to the queue", function() {
		// Save 3 items in the queue and check the length of the queue
		// Note there should be 1 item already in the queue from the beforeEach step
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
		expect(JSON.parse(window.localStorage.getItem("offlineSaveQueue")).length).toBe(4);
	  });
	});

	describe("invokeCallBack", function() {
	  it("saves on Parse the original Object saved in the queue", function() {
		// Process the queue and check that offlineSaveQueue's create method is called with (dummyObject, "DummyObject") as its arguments
		spyOn(offlineSaveQueue, 'invokeCallBack').andCallThrough();
		offlineSaveQueue.processQueue();
		expect(offlineSaveQueue.invokeCallBack).toHaveBeenCalledWith(dummyObject, "DummyObject");
	  });
		
	  it("adds an Object back to the queue if it fails to save to Parse (test needs to be written)", function() {
		// TODO: Write this test
		expect(true).toBe(false);
	  });
	});
	
	describe("processQueue", function() {
	  it("removes an Object from the queue when it processes it", function() {
		// Process the queue and check that Local Storage is empty after processing the queue
		offlineSaveQueue.processQueue();
		expect(window.localStorage.getItem("offlineSaveQueue")).toBe(null);
	  });
		
	  it("does not process the queue with zero Objects", function() {
		// Clear Local Storage, process the queue, and check that offlineSaveQueue's invokeCallBack method is not called
		window.localStorage.clear();
		spyOn(offlineSaveQueue, 'invokeCallBack').andCallThrough();
		offlineSaveQueue.processQueue();
		expect(offlineSaveQueue.invokeCallBack).not.toHaveBeenCalled();
	  });
		
	  it("can process the queue with at least 4 Objects in it", function() {
		// Save 3 items in the queue, process the queue, and check that offlineSaveQueue's invokeCallBack method  is called 4 times
		// Note there should be 1 item already in the queue from the beforeEach step
		var spy = spyOn(offlineSaveQueue, 'invokeCallBack').andCallThrough();
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
		offlineSaveQueue.saveObject(dummyObject, "DummyObject");
		offlineSaveQueue.processQueue();
		expect(spy.callCount).toEqual(4);
	  });
	});
	
	describe("startQueueProcessing", function() {
	  beforeEach(function () {
		// Before each test, mock the clock and start the queue processing interval
		jasmine.Clock.useMock();
		offlineSaveQueue.startQueueProcessing(60000);	
	  });
		
	  it("correctly fires the queue processing interval every 60 seconds", function() {
		// Check that processQueue is initially uncalled, called once after 60 seconds, and called again after another 60 seconds
		var spy = spyOn(offlineSaveQueue, 'processQueue');
		expect(spy.callCount).toEqual(0);
		jasmine.Clock.tick(60000);
		expect(spy.callCount).toEqual(1);
		jasmine.Clock.tick(60000);
		expect(spy.callCount).toEqual(2);
	  });
		
	  afterEach(function () {
		// After each test, stop the queue processing interval
		offlineSaveQueue.stopQueueProcessing();	
	  });
	});
	
	describe("stopQueueProcessing", function() {
	  beforeEach(function () {
		// Before each test, mock the clock and start the queue processing interval
		jasmine.Clock.useMock();
		offlineSaveQueue.startQueueProcessing(60000);	
	  });
		
	  it("correctly stops the queue processing interval", function() {
		// Stop the queue processing interval
		offlineSaveQueue.stopQueueProcessing();
		
		// Check that processQueue remains uncalled over a period of 120 seconds
		var spy = spyOn(offlineSaveQueue, 'processQueue');
		expect(spy.callCount).toEqual(0);
		jasmine.Clock.tick(60000);
		expect(spy.callCount).toEqual(0);
		jasmine.Clock.tick(60000);
		expect(spy.callCount).toEqual(0);
	  });
		
	  afterEach(function () {
		// After each test, stop the queue processing interval
		offlineSaveQueue.stopQueueProcessing();	
	  });
	});
	
	
	describe("count", function() {
	  it("correctly returns the number of items in an empty queue", function() {
			// Process the queue and check that offlineSaveQueue's count method returns 0
			offlineSaveQueue.processQueue();
			expect(offlineSaveQueue.count()).toBe(0);
	  });
	  it("correctly returns the number of items in a queue with one item", function() {
			// Check that offlineSaveQueue's count method returns 1
			// Note there should be 1 item already in the queue from the beforeEach step
			expect(offlineSaveQueue.count()).toBe(1);
	  });
	  it("correctly returns the number of items in a queue with four items", function() {
			// Save 3 items in the queue and check that offlineSaveQueue's count method returns 4
			// Note there should be 1 item already in the queue from the beforeEach step
			offlineSaveQueue.saveObject(dummyObject, "DummyObject");
			offlineSaveQueue.saveObject(dummyObject, "DummyObject");
			offlineSaveQueue.saveObject(dummyObject, "DummyObject");
			expect(offlineSaveQueue.count()).toBe(4);
	  });
		
	  afterEach(function () {
		// After each test, clear the queue
		offlineSaveQueue.stopQueueProcessing();	
	  });
	});
	
	afterEach(function () {
		// After each test, clear the queue from local storage
		window.localStorage.removeItem("offlineSaveQueue");
	});
});