import * as vscode from "vscode";
import { paragraphsToClaims } from "./fakeInference";
import { formatClaim, formatSummary, FOOTER } from "./formatters";

/**
 * The chat-participant handler. Runs whenever the user types `@sentinel ...`
 * in the Copilot Chat panel. We:
 *
 *   1. Forward the user's prompt to a Copilot language model via vscode.lm.
 *   2. Collect the streamed model response.
 *   3. Split it into per-paragraph claims and synthesize confidence,
 *      evidence, and flag metadata for each (deterministic, disclosed).
 *   4. Stream the original answer back as Sentinel-formatted markdown — a
 *      summary header, then one collapsible alert block per claim, then a
 *      footer that's honest about the synthesized metadata.
 *
 * Variant: `/review` command. The user pastes a previously-generated
 * response after `@sentinel /review ...` and we wrap *that* text instead
 * of calling the model — useful for auditing answers from elsewhere.
 */
export async function handle(
  request: vscode.ChatRequest,
  _context: vscode.ChatContext,
  response: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  if (request.command === "review") {
    return reviewExisting(request.prompt, response);
  }
  return reviewNewResponse(request.prompt, response, token);
}

async function reviewNewResponse(
  prompt: string,
  response: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  if (!prompt.trim()) {
    response.markdown(
      "Ask anything after `@sentinel` and I'll wrap the response with " +
        "confidence, evidence, and hallucination flags. Try: `@sentinel " +
        "explain how garbage collection works in V8`."
    );
    return {};
  }

  // Pick a Copilot-provided model. vscode.lm exposes whichever models the
  // user has authorized — typically a GPT-class model when Copilot is
  // installed. We prefer larger models for evaluation quality, but fall
  // back to the first available so the participant degrades gracefully.
  const models = await vscode.lm.selectChatModels({ vendor: "copilot" });
  if (models.length === 0) {
    response.markdown(
      "> [!WARNING]\n> Sentinel needs an authorized chat model (e.g. via " +
        "GitHub Copilot) to call. None are available right now."
    );
    return {};
  }
  const model = models.find((m) => /(gpt-4|sonnet)/i.test(m.id)) ?? models[0];

  response.progress(`Thinking with ${model.name}…`);

  const messages = [
    vscode.LanguageModelChatMessage.User(prompt),
  ];

  let collected = "";
  try {
    const reply = await model.sendRequest(messages, {}, token);
    for await (const chunk of reply.text) {
      collected += chunk;
    }
  } catch (e) {
    response.markdown(
      `> [!WARNING]\n> Model call failed: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
    return { errorDetails: { message: e instanceof Error ? e.message : String(e) } };
  }

  return renderClaims(collected, response);
}

async function reviewExisting(
  prompt: string,
  response: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  if (!prompt.trim()) {
    response.markdown(
      "Paste the AI response you want me to audit after `@sentinel /review`. " +
        "I'll wrap each paragraph with confidence, evidence, and flag chips."
    );
    return {};
  }
  return renderClaims(prompt, response);
}

function renderClaims(
  text: string,
  response: vscode.ChatResponseStream
): vscode.ChatResult {
  const claims = paragraphsToClaims(text);
  if (claims.length === 0) {
    response.markdown(text);
    response.markdown(
      "\n\n_Sentinel didn't find any reviewable paragraphs in that response._"
    );
    return {};
  }

  response.markdown(formatSummary(claims) + "\n\n");
  for (const c of claims) {
    response.markdown(formatClaim(c) + "\n\n");
  }
  response.markdown("\n---\n\n" + FOOTER);

  // Surface a follow-up the user can click to see the standalone Sentinel
  // sandbox — same trick as the Chrome extension's popup launcher.
  response.button({
    command: "vscode.open",
    title: "Open Sentinel sandbox in browser",
    arguments: [vscode.Uri.parse("https://github.com/sinhaankur/Human-in-the-Loop")],
  });

  return {
    metadata: {
      claimCount: claims.length,
      flaggedCount: claims.filter((c) => c.band === "low" || c.band === "unsure").length,
    },
  };
}
