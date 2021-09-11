# Blackmagic Design Smart Videohub Client
This package makes it possible to control a Blackmagic Design Smart Videohub from Node.JS.
## Installation
Install `bmd-videohub-client` using:

    npm install --save bmd-videohub-client


## Notes
This package contains of a set of methods to send data to and get data from a Videohub. 

Due to the way the Ethernet protocol for the Videohub is set up it is not possible to directly request data from a Videohub. That's why this package kees track of the actual Videohub state in-memory. When the state of the Videohub changes the in-memory storage gets updated. To get instant updates you have to subscribe to the dataSubject Subject (requires RxJS).  

Input and output numbers are index based meaning input 1 = 0 and so on.

## Basic usage

    import { Videohub } from 'bmd-videohub-client';
    
    Videohub.connect("127.0.0.1", 9990).then(() => {
	    console.log(Videohub.getDeviceInfo());
	    console.log(Videohub.getOutputRouting());
	    Videohub.changeOutputRoute(0, 2);
	    Videohub.changeInputLabel(0, "Label for input 1");
    });
    
    process.on('SIGINT', () => {
		Videohub.disconnect();
		process.exit();
	});





## API

### Connect
 `connect(ipAddress: string, port: number): Promise<>`

### Disconnect
`disconnect()`

### GetDeviceInfo
`getDeviceInfo()`  
Returns information about the device currently connected. 
For example:
```json
{
  "Device present": true,
  "Model name": "Blackmagic Smart Videohub",
  "Video inputs": 16,
  "Video processing units": 0,
  "Video outputs": 16,
  "Video monitoring outputs": 0,
  "Serial ports": 0
}
```

### GetInputLabels
`getInputLabels(): Label[]`  
Returns an array of the labels set for the inputs.
For example: 
```json
[
   {
      "index":0,
      "text":"Label for input 1"
   },
   {
      "index":1,
      "text":"no label"
   },
   {
      "index":2,
      "text":"no label"
   }
]
```
### GetOutputLabels
`getOutputLabels(): Label[]`  
Returns an array of the labels set for the outputs.
For example: 
```json
[
   {
      "index":0,
      "text":"Label for output 1"
   },
   {
      "index":1,
      "text":"no label"
   },
   {
      "index":2,
      "text":"no label"
   }
]
```
### ChangeInputLabel
`changeInputLabel(index: number, text: string)`  
Sets the text for a input label by index.

### ChangeOutputLabel
`changeOutputLabel(index: number, text: string)`

### GetOutputRouting
`getOutputRouting(): Route[]`  
Returns an array of the current routing, sorted by output. It also shows the lock state of the outputs
For example:
```json
[
   {
      "output":0,
      "input":2,
      "locked":"U"
   },
   {
      "output":1,
      "input":2,
      "locked":"U"
   },
   {
      "output":2,
      "input":3,
      "locked":"U"
   }
]
```

### ChangeOutputRoute
`changeOutputRoute(output: number, input: number)`  
Changes the input for a given output.

### LockOutput
`lockOutput(output: number)`  
Locks an output. This means the output can only be changed from the current device. 

### UnlockOutput
`unlockOutput(output:number)`  
Unlocks an output.

## Models

### Label
index: number;
text: string;

### Route
output: number;
input: number;
locked: LockState;

### LockState (enum)
LOCKED_FROM_OTHER_DEVICE = 'L',
LOCKED_FROM_THIS_DEVICE = 'O',
UNLOCKED = 'U'

### Command (enum)
INPUT_LABELS = 'INPUT LABELS:',
OUTPUT_LABELS = 'OUTPUT LABELS:',
VIDEO_OUTPUT_ROUTING = 'VIDEO OUTPUT ROUTING:',
VIDEO_OUTPUT_LOCKS = 'VIDEO OUTPUT LOCKS:',