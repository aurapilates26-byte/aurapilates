export type PgCopyBlock = {
  table: string;
  columns: string[];
  rows: string[][];
};

function unescapeCopyField(value: string): string | null {
  if (value === "\\N") return null;
  return value
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\\\/g, "\\");
}

/** Extrait les blocs COPY ... FROM stdin du dump pg_dump. */
export function parsePgCopyBlocks(sql: string): PgCopyBlock[] {
  const blocks: PgCopyBlock[] = [];
  const lines = sql.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const match = /^COPY public\.(\w+) \((.+)\) FROM stdin;$/.exec(line);
    if (!match) {
      i += 1;
      continue;
    }

    const table = match[1]!;
    const columns = match[2]!
      .split(",")
      .map((c) => c.trim().replace(/^"|"$/g, ""));

    i += 1;
    const rows: string[][] = [];
    while (i < lines.length && lines[i] !== "\\.") {
      const rowLine = lines[i]!;
      if (rowLine.length > 0) {
        rows.push(rowLine.split("\t").map(unescapeCopyField) as string[]);
      }
      i += 1;
    }

    blocks.push({ table, columns, rows });
    i += 1;
  }

  return blocks;
}

export function copyBlockByTable(blocks: PgCopyBlock[], table: string): PgCopyBlock | undefined {
  return blocks.find((b) => b.table === table);
}
