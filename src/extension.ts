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
	
				// Copy snippet to clipboard
				await vscode.env.clipboard.writeText(finalSnippet);

				// Check if .vscode folder exists in the workspace
				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (!workspaceFolders) {
					// Show output in the ouput channel & provide language id as json
					const outputChannel = vscode.window.createOutputChannel('Code to Snippet', 'json');
					outputChannel.appendLine(finalSnippet);
					outputChannel.show(true);
					vscode.window.showInformationMessage('Snippet created successfully and copied to clipboard');
					return;
				}

				const workspacePath = workspaceFolders[0].uri.fsPath;
				const vscodePath = `${workspacePath}/.vscode`;
				const snippetsPath = `${vscodePath}/snippets.code-snippets`;

				// Create .vscode folder if it doesn't exist
				if(!await vscode.workspace.fs.stat(vscode.Uri.file(vscodePath))) {
					try {
						await vscode.workspace.fs.createDirectory(vscode.Uri.file(vscodePath));
					} catch (error) {
						vscode.window.showErrorMessage('An error occurred while creating the .vscode folder');
						return;
					}
				}

				// Create snippets.vscode-snippets file if it doesn't exist and put {} in it
				if(!await vscode.workspace.fs.stat(vscode.Uri.file(snippetsPath))) {
					try {
						await vscode.workspace.fs.writeFile(vscode.Uri.file(snippetsPath), Buffer.from('{}'));
					} catch (error) {
						vscode.window.showErrorMessage('An error occurred while creating the snippets file');
						return;
					}
				}

				// Read the existing snippets
				const snippetsFile = await vscode.workspace.fs.readFile(vscode.Uri.file(snippetsPath));
				const snippetsContent = snippetsFile.toString();
				const snippets = JSON.parse(snippetsContent);

				// Add the new snippet
				snippets[snippetDescription] = snippet;

				// Write the updated snippets
				await vscode.workspace.fs.writeFile(vscode.Uri.file(snippetsPath), Buffer.from(JSON.stringify(snippets, null, 2)));

				vscode.window.showInformationMessage('Snippet saved successfully and copied to clipboard');
			} catch (error) {
				vscode.window.showErrorMessage('An error occurred while creating the snippet');
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
