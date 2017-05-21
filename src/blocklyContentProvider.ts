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

	public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
		const sourceUri = vscode.Uri.parse(uri.query);

		let initialLine: number | undefined = undefined;
		const editor = vscode.window.activeTextEditor;
		if (editor && editor.document.uri.fsPath === sourceUri.fsPath) {
			initialLine = editor.selection.active.line;
		}

		return vscode.workspace.openTextDocument(sourceUri).then(document => {
			const initialData = {
				previewUri: uri.toString(),
				source: sourceUri.toString(),
				line: initialLine
			};

            return fs.readFileSync(path.join(this.context.extensionPath, "src/blockly/index.html"), "utf8");
		});
	}
};