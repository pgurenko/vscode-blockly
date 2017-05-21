'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

export default class BlocklyLinkProvider implements vscode.DocumentLinkProvider {

	constructor() { }

	public provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentLink[] {
		const results: vscode.DocumentLink[] = [];
		const base = path.dirname(document.uri.fsPath);
		const text = document.getText();
        console.log(text);
		return results;
	}
}