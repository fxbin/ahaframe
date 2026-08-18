interface StructuredDataProps {
  value: Record<string, unknown> | Array<Record<string, unknown>>;
}

function jsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function StructuredData({ value }: StructuredDataProps) {
  const nodes = Array.isArray(value) ? value : [value];
  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={`${String(node["@type"] ?? "schema")}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(node) }}
        />
      ))}
    </>
  );
}
