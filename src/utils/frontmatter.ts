import yaml from 'js-yaml';

export interface RawParsedMarkdown {
  data: Record<string, any>;
  content: string;
}

export function parseFrontmatter(raw: string): RawParsedMarkdown {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }

  try {
    const data = (yaml.load(match[1]) as Record<string, any>) || {};
    return {
      data,
      content: match[2],
    };
  } catch {
    return {
      data: {},
      content: match[2],
    };
  }
}
