### File layout

This covers the three main folders in the project

-----------------------------------------------------------------------------------------------

#### ./GameObject/

Contains all classes extending off the base GameObject class.

The game object class is pretty simple. The main functions for it are its update
function which accepts a progress in milliseconds, and a draw function with accepts a
ctx: OffscreenCanvasRenderingContext2D variable. It is basically the same as a normal
canvas rendering context...

Game objects also have a isGarbage boolean which can be used to prevent the loop from including
a particular game object while looping over. I found this to be a pretty elegant way to handle
the deleting of objects

-----------------------------------------------------------------------------------------------

#### ./OnetimeOrShared/

Contains functions and objects that are mutated a lot, like resolution for example, or functions that
are only called once typically, like titleScreen. The files in this folder are not to be entrusted for
non changing use cases and are to just split up the code

-----------------------------------------------------------------------------------------------

#### ./Utility/

The files contained within this folder are methods and classes that can be utilized by other files. 
These files should not be mutated by others, in comparison to OnetimeOrShared. 

-----------------------------------------------------------------------------------------------

### Other Notes

There is another file structure that you might see when things like audio are used. The audio is
stored in the public folder. Other things such as images would also be stored in the public folder
if they are added to the game...
