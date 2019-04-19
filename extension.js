const vscode = require('vscode');
const path = require('path');
const fs = require('fs-extra');
const ERRORS = {
    misconfiguration:'Please configure Tesserak paths before',
    unreplaceable:'A file in the same position already exists.\nYour settings avoid to override it'
};
const MESSAGES = {
    successCopyed:'Copied file to output location',
    successCopyedFolder:'Copied folder and content to output location'
};
class Tesserak {
    constructor(){
        const settings = vscode.workspace.getConfiguration('tesserak');
        if(!settings.has('pathMapping') || typeof settings.get('pathMapping')[0].input === 'undefined' || typeof settings.get('pathMapping')[0].output === 'undefined'){
            this.showErrorMessage('misconfiguration');
            this.hasConfig = false;
        }else{
            this.inputPath = settings.get('pathMapping')[0].input;
            this.outpuPath = settings.get('pathMapping')[0].output;
            this.hasConfig = true;
        }
        this.replaceIfExists = (!settings.has('replaceIfExists') || typeof settings.replaceIfExists !== 'boolean') ? true : settings.get('replaceIfExists');
    }
    showErrorMessage(error){
        vscode.window.showErrorMessage(ERRORS[error]);
    }
    showMessage(message){
        vscode.window.showInformationMessage(MESSAGES[message]);
    }
    showMessageAndOpenFile(message, file){
        vscode.window.showInformationMessage(MESSAGES[message], 'open file').then(() => {
            vscode.workspace.openTextDocument(file).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        });
    }
    displayStatusBarMessage(message){
        this.statusBar = vscode.window.createStatusBarItem(1);
        this.statusBar.text = MESSAGES[message];
        this.statusBar.show();
        this.timer = setTimeout(() => {
            this.statusBar.hide();
            this.statusBar = null;
        }, 3000);
    }

    file() {
        if (this.inputFiles.length) {
            this.inputFiles.forEach(file=>{
                const outputFile = this.getOutputFile(file.fsPath);
                if(!this.skipFile(outputFile) && outputFile !== ''){
                    fs.mkdirp(path.dirname(outputFile)).then(() => {
                        fs.copy(file.fsPath, outputFile).then(() => {
                            this.displayStatusBarMessage('successCopyed');
                            if(!!path.extname(file.fsPath)){
                                this.showMessageAndOpenFile('successCopyed',outputFile);
                            }else{
                                this.showMessage('successCopyedFolder');
                            }
                            
                        });
                    });
                }else{
                    this.showErrorMessage('unreplaceable');
                }
            });
        }
    }
    skipFile(file){
        return this.replaceIfExists === false && fs.pathExistsSync(file);
    }

    getOutputFile(file){
        const relativeFile = vscode.workspace.asRelativePath(file, false);
        this.workspacePath = file.replace(relativeFile, '');
        if(relativeFile.startsWith(this.inputPath)){
            return `${this.workspacePath}${this.outpuPath}${relativeFile.replace(this.inputPath, '')}`;
        }else{
            return '';
        }
    }

    dispose() {
        clearTimeout(this.timer);
        this.timer = null;
        this.statusBar.dispose();
        this.statusBar = null;
        this._pathMapping = null;
    }

}

function activate() {
    const tesserak = new Tesserak();
    vscode.commands.registerCommand('extension.tesserakThis', (file, files) => {
        if (tesserak.hasConfig) {
            const fileList = files.length?files:[file];
            tesserak.inputFiles = fileList;
            tesserak.file();
        } else {
            tesserak.showErrorMessage();
        }

    });
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;