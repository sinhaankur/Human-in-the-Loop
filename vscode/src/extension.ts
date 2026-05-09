import * as vscode from "vscode";
import { handle } from "./sentinel-participant";

export function activate(context: vscode.ExtensionContext) {
  // Register @sentinel as a chat participant. The id matches what's
  // declared under contributes.chatParticipants in package.json.
  const participant = vscode.chat.createChatParticipant(
    "sentinel-vscode.sentinel",
    handle
  );
  // Sentinel's icon shown next to its responses in the chat panel.
  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, "icons", "icon-128.png");
  context.subscriptions.push(participant);
}

export function deactivate() {
  // No-op: createChatParticipant is disposed via context.subscriptions.
}
