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

	public relativeToAbsolute(start:string, html:string):string {
		var pos = html.indexOf(start);
		while(pos != -1) {
			html = [
				html.substr(0, pos+start.length),
				'file:///', path.join(this.context.extensionPath, "src/editor/"), 
				html.substr(pos+start.length)].join('');
			console.log(html.substr(pos, 100));
			pos = html.indexOf(start, pos + 1);
		}
		return html;
	}

	public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		var editorHtml = fs.readFileSync(path.join(this.context.extensionPath, "src/editor/index.html"), "utf8");
		editorHtml = this.relativeToAbsolute('href="', editorHtml);
		editorHtml = this.relativeToAbsolute('src="', editorHtml);
		editorHtml = this.relativeToAbsolute('<media>', editorHtml);
		return editorHtml;
	}
};