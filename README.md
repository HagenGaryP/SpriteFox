# SpriteFox

A real-time collaborative pixel art editor, where people can come together to create and animate sprites.

## To see the deployed version go to:

https://spritefox.herokuapp.com/

## Setup

To use/edit Spritefox, you'll need to take the following steps:

* Fork or clone this repo
* npm install

## Start

To run the website locally:

* Run `npm run start-dev`
* Then navigate to:
  http://localhost:3000/

If you want to run the server and/or `webpack` separately, you can also
`npm run start-server` and `npm run build-client`.



IN THE PROCESS OF CONVERTING THE CLASS COMPONENT TO HOOKS:

The original Class Component, Canvas.js, was entirely too large and unmanageable. 
So, I've been attempting to refactor the entire app using React Hooks to get a better understanding 
of working with hooks as well as improve the code's readability/scalability.

So far, while converting to hooks, I was able to keep most of the functionality that my team originally had, 
with a few errors along the way.


Errors:

1) adding more than one frame loses access to the 'canvas' element, which make me think that it's losing its reference. 
If that's not the case, then my next assumption would be that the way I declared canvas is causing this issue. 
However, when I tried to declare canvas as a hook, to put it on the state, this caused issues with just about every other function.

2) At the moment, the app is just an amalgamation of code into one mess of a file. 
I'm keeping it like this for now just to see if I can obtain the same functionality using hooks as when it was a class component. 
Once I have a better understanding of passing the proper values and current state along, 
I will split the functions into separate files to make it much cleaner.

3) Even though it isn't exactly "traditional" to write a stateful functional component (with hooks) with a bunch of other nested functions, I wanted to see if it were possible to accomplish the same goal as splitting them apart and passing along the variables during function calls.

4) Memory leaks - Typically done with componentDidUpdate in class components, 
will essentially unsubscribe from the events that are being listened for. 
This form of "clean up" is not being done, but will be implemented once the above errors are corrected. 
I find it easier to comprehend with hooks and I also am prioritizing it a bit less at the moment. 
Inside a given "useEffect" hook where you're subscribing to listen to an event, after updating the state (if it changes), 
the effect would have a "cleanup" phase to remove the effect and essentially unsubscribe from the listened event. 
This is usually done by adding the optional second argument to useEffect to tell React what actually matters about 
the specific hook - it will listen for the state change and expect a different value for that variable (or variables) 
passed as a 2nd argument.


TODO:

Implement DB - Considering firebase, so it can handle sockets too.

More tools - eyedropper, recent colors used

Looping animation - 

Import/export the canvas/frame as png and png to canvas frame.  Hopefully as a gif for animation too.

More sockets - Chat rooms - sockets allowing for room specific messages to better collaborate.
        
        Also, allow for collaborators to work on separate frames/canvases.
