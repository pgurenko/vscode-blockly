'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import BlocklyLinkProvider from './documentLinkProvider';
import { BlocklyContentProvider, getBlocklyUri } from './blocklyContentProvider';

interface IPackageInfo {
	name: string;
	version: string;
	aiKey: string;
}

export function activate(context: vscode.ExtensionContext) {
    const packageInfo = getPackageInfo();

    console.log('Blockly extension is up!');

	const contentProvider = new BlocklyContentProvider(context)
	const contentProviderRegistration = vscode.workspace.registerTextDocumentContentProvider('blockly', contentProvider);
	
	context.subscriptions.push(vscode.languages.registerDocumentLinkProvider('blockly', new BlocklyLinkProvider()));
	
    context.subscriptions.push(vscode.commands.registerCommand('blockly.showBlockly', showBlockly));
	context.subscriptions.push(vscode.commands.registerCommand('blockly.showBlocklyToSide', uri => showBlockly(uri, true)));
	context.subscriptions.push(vscode.commands.registerCommand('blockly.showSource', showSource));
	context.subscriptions.push(vscode.commands.registerCommand('blockly.save', save));

	showBlockly();
}

function showBlockly(uri?: vscode.Uri, sideBySide: boolean = false) {
	let resource = uri;
	if (!(resource instanceof vscode.Uri)) {
		if (vscode.window.activeTextEditor) {
			// we are relaxed and don't check for markdown files
			resource = vscode.window.activeTextEditor.document.uri;
		}
	}

	if (!(resource instanceof vscode.Uri)) {
		if (!vscode.window.activeTextEditor) {
			// this is most likely toggling the preview
			return vscode.commands.executeCommand('blockly.showSource');
		}
		// nothing found that could be shown or toggled
		return;
	}

	const thenable = vscode.commands.executeCommand('vscode.previewHtml',
		getBlocklyUri(resource),
		getViewColumn(sideBySide),
		`Blockly Editor - '${path.basename(resource.fsPath)}'`);

	return thenable;
}

function getViewColumn(sideBySide: boolean): vscode.ViewColumn | undefined {
	const active = vscode.window.activeTextEditor;
	if (!active) {
		return vscode.ViewColumn.One;
	}

	if (!sideBySide) {
		return active.viewColumn;
	}

	switch (active.viewColumn) {
		case vscode.ViewColumn.One:
			return vscode.ViewColumn.Two;
		case vscode.ViewColumn.Two:
			return vscode.ViewColumn.Three;
	}

	return active.viewColumn;
}

function showSource(uri: vscode.Uri) {
	if (!uri) {
		return vscode.commands.executeCommand('workbench.action.navigateBack');
	}

	const docUri = vscode.Uri.parse(uri.query);
	for (const editor of vscode.window.visibleTextEditors) {
		if (editor.document.uri.scheme === docUri.scheme && editor.document.uri.fsPath === docUri.fsPath) {
			return vscode.window.showTextDocument(editor.document, editor.viewColumn);
		}
	}

	return vscode.workspace.openTextDocument(docUri)
		.then(vscode.window.showTextDocument);
}

function save(uri: vscode.Uri) {
	console.log('save!!!');
	console.log(Buffer.from(uri.toString(), 'base64').toString());
}

function getPackageInfo(): IPackageInfo | null {
	const extention = vscode.extensions.getExtension('vscode-blockly');
	if (extention && extention.packageJSON) {
		return {
			name: extention.packageJSON.name,
			version: extention.packageJSON.version,
			aiKey: extention.packageJSON.aiKey
		};
	}
	return null;
}
// this method is called when your extension is deactivated
export function deactivate() {
}