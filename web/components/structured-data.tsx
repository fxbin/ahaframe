interface StructuredDataProps {
  value: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function StructuredData({ value }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
    />
  );
}
