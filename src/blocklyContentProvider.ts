'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getBlocklyUri(uri: vscode.Uri) {
	if (uri.scheme === 'blockly') {
		return uri;
	}

	return uri.with({
		scheme: 'blockly',
		path: uri.fsPath + '.rendered',
		query: uri.toString()
	});
}


export class BlocklyContentProvider implements vscode.TextDocumentContentProvider {
	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

	private extraStyles: Array<vscode.Uri> = [];
	private extraScripts: Array<vscode.Uri> = [];

	constructor(
		private context: vscode.ExtensionContext,
	) {
	}

	public addScript(resource: vscode.Uri): void {
		this.extraScripts.push(resource);
	}

	public addStyle(resource: vscode.Uri): void {
		this.extraStyles.push(resource);
	}

	private getMediaPath(mediaFile: string): string {
		return vscode.Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
	}

	public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		var editorHtml = fs.readFileSync(path.join(this.context.extensionPath, "src/editor/index.html"), "utf8");
		
		var pos = editorHtml.indexOf('href="');
		if(pos != -1) {
			editorHtml = [
				editorHtml.substr(0, pos+6), 
				'file:///', path.join(this.context.extensionPath, "src/editor/"),
				editorHtml.substr(pos+6)].join('');
		}

		pos = editorHtml.indexOf('src="');
		while(pos != -1) {
			editorHtml = [
				editorHtml.substr(0, pos+5),
				'file:///', path.join(this.context.extensionPath, "src/editor/"), 
				editorHtml.substr(pos+5)].join('');
			console.log(editorHtml.substr(pos, 100));
			pos = editorHtml.indexOf('src="', pos + 1);
		}
		return editorHtml;
	}
};