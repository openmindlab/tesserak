<p align="center">
    <img src="https://raw.githubusercontent.com/openmindlab/tesserak/master/resources/tesserak_small.png" alt="Tesserak">
</p>

# Tesserak

Visual Studio Code plugin which copy a file to a specified output location related to the project

## Extension Settings

```json
"tesserak.pathMapping": [
    {
        "input": "/home/source1/",
        "output": "/home/destination1/"
    }
]
```

Replace an exisiting file at the output location if it already exists. Default is true.
```json
"tesserak.replaceIfExists": true
```


## Example Scenarios

Right click on file(s) or folder(s) within the explorer view and select ***Tesserak this!*** context menu voice.
It will create a copy of given file(s) or folder(s) to output destination mantaining the folder structure.

### Notes ###

We suggest to create a Workspace Settings file in order to use relative paths.
