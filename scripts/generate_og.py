from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "site" / "assets" / "og-ahaframe.png"


def _font(size: int, *, bold: bool = False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    candidates = [
        Path("/usr/share/fonts/truetype/dejavu") / name,
        Path("/usr/share/fonts/dejavu") / name,
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def generate_og(output: Path = DEFAULT_OUTPUT) -> Path:
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)

    image = Image.new("RGB", (1200, 630), "#fbfbf8")
    draw = ImageDraw.Draw(image)
    bold = _font(68, bold=True)
    medium = _font(28)
    logo = _font(36, bold=True)

    # Brand mark.
    points = [(78, 56), (105, 40), (132, 56), (132, 88), (105, 104), (78, 88)]
    draw.line(points + [points[0]], fill="#0f766e", width=7, joint="curve")
    draw.text((150, 48), "AhaFrame", fill="#17201e", font=logo)

    # Main message.
    draw.text((78, 190), "Understand AI", fill="#17201e", font=bold)
    draw.text((78, 275), "by seeing it work.", fill="#0f766e", font=bold)
    draw.text(
        (82, 390),
        "Interactive visual lessons for AI engineering.",
        fill="#65716c",
        font=medium,
    )

    # Compact Token Playground preview.
    draw.rounded_rectangle(
        (790, 145, 1115, 475), radius=28, fill="#ffffff", outline="#e2e7e3", width=2
    )
    draw.text((830, 190), "Token Playground", fill="#17201e", font=logo)
    for y, label, width, probability in [
        (278, "Paris", 210, "91%"),
        (334, "Lyon", 70, "3%"),
        (390, "located", 42, "2%"),
    ]:
        draw.text((830, y - 8), label, fill="#47544f", font=medium)
        draw.rounded_rectangle((940, y, 1090, y + 14), radius=7, fill="#edf0ed")
        draw.rounded_rectangle((940, y, 940 + width // 2, y + 14), radius=7, fill="#0f766e")
        draw.text((1098, y - 9), probability, fill="#65716c", font=medium)

    image.save(output, optimize=True)
    return output


if __name__ == "__main__":
    print(generate_og())
