import { renderMermaidSVG, THEMES } from "beautiful-mermaid";
import { system } from "@silverbulletmd/silverbullet/syscalls";
import { CodeWidgetContent } from "@silverbulletmd/silverbullet/type/client";

export async function widget(
  bodyText: string,
): Promise<CodeWidgetContent> {
  const config = await system.getConfig("mermaid", {});

  const options: Record<string, unknown> = {};

  if (config?.theme && THEMES[config.theme as string]) {
    Object.assign(options, THEMES[config.theme as string]);
  }

  for (const key of ["bg", "fg", "line", "accent", "muted", "surface", "border", "font", "transparent", "padding", "nodeSpacing", "layerSpacing"]) {
    if (config?.[key] !== undefined) {
      options[key] = config[key];
    }
  }

  let html: string;
  try {
    const svg = renderMermaidSVG(bodyText, options as Parameters<typeof renderMermaidSVG>[1]);
    html = `<div style="max-width:100%;overflow:auto">${svg}</div>`;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    html = `<pre style="color:red;white-space:pre-wrap">Mermaid error: ${msg}</pre>`;
  }

  return {
    html,
    script: `
    document.addEventListener("click", () => {
      api({type: "blur"});
    });
    updateHeight();
    `,
  };
}
