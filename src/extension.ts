// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { fstat, stat } from 'fs';

function getfile_path(line: String, char_pos: Number) {
    // console.log(" line %s, pos %d",line, char_pos);
    let split_line = line.split(" ");
    let length = 0;
    // console.log(split_line);
    for (let i in split_line) {
        length = length + split_line[i].length + 1;
        // console.log("Length %d, Entry %s", length, split_line[i])
        if (length>char_pos) {
            return split_line[i];
        }
    }
    return "";
}

function stripfile_path(line: String) {
    let new_line = line.replace(/\'/g,'');
        new_line = new_line.replace(/\"/g,'');

    return new_line;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "go-file-undercursor" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.go-file-undercursor', () => {
		// The code you place here will be executed every time your command is executed


        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let line_pos = editor.selection.active.line;
        let char_pos = editor.selection.active.character;
        let line     = editor.document.lineAt(line_pos).text;

        let file_path = getfile_path(line, char_pos);
            file_path = stripfile_path(file_path);
        
        if (file_path.charAt(0) === '/')        { //Do Nothing
        }
        else if(file_path.charAt(0) === '~'){ //Home Path
            file_path = file_path.replace(/~/, String(process.env["HOME"]));
        }
        else { //Relative Path
            file_path = path.dirname(editor.document.uri.fsPath) + "/" + file_path;
        }

        //Strip * at file name
        if( path.basename(file_path).match(/\*/) ) {
            file_path = path.dirname(file_path);
        }

        let uri = vscode.Uri.file(file_path);
        let options: vscode.OpenDialogOptions = {
            defaultUri: uri
        };
        
        console.log("File path : %s",file_path);
        //Check Path Type
        
        stat(file_path, function(err, stat) {
            if (stat.isDirectory()){
                vscode.window.showOpenDialog(options);
            }
            else {
                vscode.commands.executeCommand('vscode.open',uri);
            }
        });
        

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
