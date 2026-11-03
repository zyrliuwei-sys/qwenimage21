export function ArticleTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div
      className="border-border my-6 overflow-x-auto rounded-lg border"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-6">
        <caption className="text-muted-foreground px-4 py-3 text-left text-xs">
          {caption}
        </caption>
        <thead className="bg-muted/60">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-border border-t align-top">
              {row.map((cell, index) => (
                <td key={index} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
