const vscode = require('vscode');
const path = require('path');
const fs = require('fs-extra');

class Tesserak {
    constructor(){
        const settings = vscode.workspace.getConfiguration('tesserak');
        console.log(settings.has('pathMapping'));
        if(!settings.has('pathMapping') || typeof settings.get('pathMapping')[0].input === 'undefined' || typeof settings.get('pathMapping')[0].output === 'undefined'){
            this.displayConfigurationMessage();
            this.hasConfig = false;
        }else{
            this.inputPath = settings.get('pathMapping')[0].input;
            this.outpuPath = settings.get('pathMapping')[0].output;
            this.hasConfig = true;
        }
        this.replaceIfExists = (!settings.length || typeof settings.replaceIfExists === 'undefined') ? true : settings.replaceIfExists;
    }
    displayConfigurationMessage(){
        vscode.window.showErrorMessage('Please configure Tesserak paths before');
    }
    /* set settings(settings) {
        this.pathMapping = settings.get('pathMapping', []);
        this.replaceIfExists = settings.get('replaceIfExists', true);
    }

    set pathMapping(pathMapping) {
        this.pathMapping = Array.isArray(pathMapping) ? pathMapping : [];
    }

    get pathMapping() {
        return this.pathMapping;
    }

    set replaceIfExists(replaceIfExists) {
        this.replaceIfExists = replaceIfExists === false ? false : true;
    }

    get replaceIfExists() {
        return this.replaceIfExists;
    } */


    /* set inputFiles(inputFiles) {
        this.inputFiles = inputFiles && path.isAbsolute(inputFiles) ? inputFiles : [];
    }

    get inputFiles() {
        return this.inputFiles || [];
    } */

    file() {
        if (this.inputFiles.length) {
            /* this.skipCount = 0;
            for (let i = 0; i < this.pathMapping.length; i++) {
                const pathMap = this.pathMapping[i];
                this.setOutputFile(pathMap);
                if (this.outputFile) {
                    if (this.isSkip(pathMap)) {
                        this.skipCount++;
                        continue;
                    }
                    fs.mkdirp(path.dirname(this.outputFile)).then(() => {
                        fs.copy(this.inputFiles, this.outputFile).then(() => {
                            this.setStatus();
                        });
                    });
                }
            } */
        }
    }

    /* isSkip() {
        let ret = false;
        if ((!this.replaceIfExists && fs.ensureFileSync(this.outputFile))) {
            ret = true;
        }
        return ret;
        return (!this.replaceIfExists && fs.ensureFileSync(this.outputFile));
    }

    getReplaceIfExists(replaceIfExists) {
        return replaceIfExists === false || replaceIfExists === true ? replaceIfExists : this.replaceIfExists;
    } */

    setOutputFile(pathMapping) {
        this.outputFile = null;
        if (pathMapping.input && pathMapping.output) {
            const relativeFile = vscode.workspace.asRelativePath(this.inputFiles, false);
            this.workspacePath = this.inputFiles.replace(relativeFile, '');
            if (relativeFile.startsWith(pathMapping.input)) {
                this.outputFile = `${this.workspacePath}${pathMapping.output}${relativeFile.replace(pathMapping.input, '')}`;
            }
        }
    }

    setStatus() {
        const baseText = "Copied file to output location";
        this.statusBar = vscode.window.createStatusBarItem(1);
        this.statusBar.text = baseText;
        this.statusBar.show();
        this.timer = setTimeout(() => {
            this.statusBar.hide();
            this.statusBar = null;
        }, 3000);
        vscode.window.showInformationMessage(baseText, 'open file').then(() => {
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

function activate() {
    const tesserak = new Tesserak();
    vscode.commands.registerCommand('extension.tesserakThis', (file, files) => {
        if (tesserak.hasConfig) {
            tesserak.inputFiles = files;
            tesserak.file();
        } else {
            tesserak.displayConfigurationMessage();
        }

    });
    /* let tf = new Tesserak();
    vscode.commands.registerCommand('extension.tesserak', (file) => {
        const configuration = vscode.workspace.getConfiguration('tesserak');
        if (configuration.pathMapping.length) {
            tf.settings = configuration;
            tf.inputFiles = file;
            tf.file();
        } else {
            vscode.window.showErrorMessage('Please configure Tesserak paths before');
        }

    });
    vscode.commands.registerCommand('extension.tesserakThis', (file, files) => {
        const configuration = vscode.workspace.getConfiguration('tesserak');
        if (configuration.pathMapping.length) {
            tf.settings = configuration;
            tf.inputFiles = files;
            tf.file();
        } else {
            vscode.window.showErrorMessage('Please configure Tesserak paths before');
        }

    }); */
    /* context.subscriptions.push(tf);
    context.subscriptions.push(tesserakFileCmd); */
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;