from pathlib import Path
import base64

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "og-ahaframe.png.b64"
DEFAULT_OUTPUT = ROOT / "site" / "assets" / "og-ahaframe.png"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def generate_og(output: Path = DEFAULT_OUTPUT) -> Path:
    """Materialize the prebuilt Open Graph image without native dependencies."""
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)

    data = base64.b64decode(SOURCE.read_text(encoding="ascii"), validate=True)
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("og-ahaframe.png.b64 does not contain a valid PNG")

    output.write_bytes(data)

    # src/assets is copied wholesale before this function runs. Do not expose the
    # base64 source file in the generated public site.
    copied_source = output.parent / SOURCE.name
    if copied_source.exists():
        copied_source.unlink()

    return output


if __name__ == "__main__":
    print(generate_og())
