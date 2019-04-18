// Libraries
const vscode = require('vscode');
const path = require('path');
const fse = require('fs-extra');

class Tesserak {
    constructor() {
        this.statusBar = null;
        this.timer = null;
        this.workspacePath = '';
    }
    
    set settings(settings) {
        this.pathMapping = settings.get('pathMapping', []);
        this.replaceIfExists = settings.get('replaceIfExists', false);
    }

    set pathMapping(pathMapping) {
        this._pathMapping = Array.isArray(pathMapping) ? pathMapping : [];
    }

    get pathMapping() {
        return this._pathMapping;
    }

    set replaceIfExists(replaceIfExists) {
        this._replaceIfExists = replaceIfExists === false ? false : true;
    }

    get replaceIfExists() {
        return this._replaceIfExists;
    }


    set inputFile(inputFile) {
        this._inputFile = inputFile && path.isAbsolute(inputFile) ? inputFile : null;
    }

    get inputFile() {
        return this._inputFile;
    }

    file() {
        if (this.inputFile) {
            this.pathMapping.forEach((pathMap)=>{
                this.setOutputFile(pathMap);
                if (this.outputFile) {
                    if (this.isSkip(pathMap)) {
                        //TODO: To analize if an error show message could be better for skipped files.
                        this.setStatus("File already exist!");
                    }else{
                        fse.mkdirp(path.dirname(this.outputFile)).then(() => {
                            fse.copy(this.inputFile, this.outputFile).then(() => {
                                this.setStatus("Copied file to output location");
                            });
                        });        
                    }
                }
            });
        }
    }

    isSkip(pathMap) {
        let ret = false;
        const replaceIfExists = this.getReplaceIfExists(pathMap.replaceIfExists);
        if ((!replaceIfExists && fse.ensureFileSync(this.outputFile))) {
            ret = true;
        }
        return ret;
    }


    getReplaceIfExists(replaceIfExists) {
        return replaceIfExists === false || replaceIfExists === true ? replaceIfExists : this.replaceIfExists;
    }

    setOutputFile(pathMapping) {
        this.outputFile = null;
        if (pathMapping.input && pathMapping.output) {
            const relativeFile = vscode.workspace.asRelativePath(this.inputFile, false);
            this.workspacePath = this.inputFile.replace(relativeFile, '');
            if (relativeFile.startsWith(pathMapping.input)) {
                this.outputFile = `${this.workspacePath}${pathMapping.output}${relativeFile.replace(pathMapping.input, '')}`;
            }
        }
    }

    setStatus(statusMessage) {
        this.statusBar = vscode.window.createStatusBarItem(1);
        this.statusBar.text = statusMessage;
        this.statusBar.show();
        this.timer = setTimeout(() => {
            this.statusBar.hide();
            this.statusBar = null;
        }, 3000);
        vscode.window.showInformationMessage(statusMessage, 'open file').then(() => {
            vscode.workspace.openTextDocument(this.outputFile).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        });
    }

    clearStatus() {
        clearTimeout(this.timer);
    }

    dispose() {
        this.clearStatus();
        this.timer = null;
        this.statusBar.dispose();
        this.statusBar = null;
        this._pathMapping = null;
    }
}

function activate(context) {
    let tf = new Tesserak();
    let tesserakFileCmd = vscode.commands.registerCommand('extension.tesserak', (file) => {
        try {
            const selectedFile = file.fsPath;
            const configuration = vscode.workspace.getConfiguration('tesserak');
            if(configuration.pathMapping.length){
                tf.settings = configuration;
                tf.inputFile = selectedFile;
                tf.file();
            }else{
                vscode.window.showErrorMessage('Please configure Tesserak paths before');
            }
        }
        catch(err) {
            vscode.window.showErrorMessage('Unexpected error, check the terminal log (view -> ) for more information.', "Show log");
            console.error("An unexpected error just happened, be patience and open an issue in the github page (https://github.com/openmindlab/tesserak) with the log message below.");
            console.error(err);
        }
    });
    context.subscriptions.push(tf);
    context.subscriptions.push(tesserakFileCmd);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;