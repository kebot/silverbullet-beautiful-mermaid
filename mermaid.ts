import { renderMermaidSVG, THEMES } from "beautiful-mermaid";
import { system } from "@silverbulletmd/silverbullet/syscalls";
import { CodeWidgetContent } from "@silverbulletmd/silverbullet/type/client";

export async function widget(
  bodyText: string,
): Promise<CodeWidgetContent> {
  const config = await system.getConfig("mermaid", {});

  const options: Record<string, unknown> = {
    transparent: true,
  };

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
    html = `<div style="width:100%;overflow:auto;display: flex; justify-content: center;">${svg}</div>`;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    // output the error message
    console.error(e)

    html = `<pre style="color:red;white-space:pre-wrap">Mermaid error: ${msg}</pre>`;
  }

  return {
    html
  };
}
