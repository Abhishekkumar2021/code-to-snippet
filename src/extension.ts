import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('code-to-snippet.convertToSnippet', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}

			const selection = editor.selection;
			const text = editor.document.getText(selection);

			if (!text) {
				vscode.window.showErrorMessage('No text selected');
				return;
			}

			const lines = text.split('\r\n');

			// Ask for snippet description
			try {
				const snippetDescription = await vscode.window.showInputBox({
					placeHolder: 'Enter a description for the snippet',
					prompt: 'Enter a description for the snippet'
				});

				if (!snippetDescription) {
					vscode.window.showErrorMessage('A description is required');
					return;
				}

				// Ask for snippet prefix
				const snippetPrefix = await vscode.window.showInputBox({
					placeHolder: 'Enter a prefix for the snippet',
					prompt: 'Enter a prefix for the snippet'
				});

				if (!snippetPrefix) {
					vscode.window.showErrorMessage('A prefix is required');
					return;
				}

				// Create the snippet
				const snippet =  {
					prefix: snippetPrefix,
					body: lines,
					description: snippetDescription
				};

				const snippetString = JSON.stringify(snippet, null, 2);
				const descriptionString = JSON.stringify(snippetDescription, null, 2);

				const finalSnippet = `${descriptionString}: ${snippetString}`;

				// Show output in the ouput channel & provide language id as json
				const outputChannel = vscode.window.createOutputChannel('Code to Snippet', 'json');
				outputChannel.appendLine(finalSnippet);
				outputChannel.show(true);
				
				// Copy snippet to clipboard
				await vscode.env.clipboard.writeText(finalSnippet);

				vscode.window.showInformationMessage('Snippet created successfully and copied to clipboard');
			} catch (error) {
				console.error(error);
				vscode.window.showErrorMessage('An error occurred while creating the snippet');
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
