from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

root = Path(__file__).resolve().parents[1]
plugin_dir = root / "com.wheatland-community-church.smartthings.sdPlugin" / "imgs"


def write_png(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG")
    raw_path = path.with_name(path.stem)
    raw_path.write_bytes(path.read_bytes())


def make_plugin_icon(size: int = 584) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = 92

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((pad - 18, pad - 4, size - (pad - 18), size - (pad - 4)), fill=(36, 101, 255, 110))
    image = Image.alpha_composite(image, glow.filter(ImageFilter.GaussianBlur(24)))

    gradient = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gradient_draw = ImageDraw.Draw(gradient)
    for y in range(pad, size - pad):
        t = (y - pad) / (size - pad * 2)
        r = int(12 + (104 - 12) * t)
        g = int(82 + (196 - 82) * t)
        b = int(190 + (255 - 190) * t)
        gradient_draw.line((pad, y, size - pad, y), fill=(r, g, b, 255))
    image = Image.alpha_composite(image, gradient)

    panel = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    panel_draw = ImageDraw.Draw(panel)
    panel_draw.rounded_rectangle((pad, pad, size - pad, size - pad), radius=140, fill=(17, 94, 255, 255))
    panel_draw.rounded_rectangle((pad + 32, pad + 32, size - (pad + 32), size - (pad + 32)), radius=110, fill=(255, 255, 255, 18))
    image = Image.alpha_composite(image, panel)

    house = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    house_draw = ImageDraw.Draw(house)
    house_draw.polygon([(182, 266), (292, 184), (402, 266)], fill=(255, 255, 255, 255))
    house_draw.rounded_rectangle((196, 266, 388, 436), radius=38, fill=(255, 255, 255, 255))
    house_draw.rounded_rectangle((262, 348, 322, 436), radius=14, fill=(22, 96, 255, 255))
    house_draw.rounded_rectangle((212, 214, 372, 244), radius=16, fill=(255, 198, 72, 255))
    bolt = [(294, 170), (346, 278), (312, 278), (362, 388), (240, 286), (278, 286), (224, 170)]
    house_draw.polygon(bolt, fill=(255, 190, 58, 255))
    image = Image.alpha_composite(image, house)

    return image


def make_category_icon(size: int = 256) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = 26
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((pad, pad, size - pad, size - pad), radius=52, fill=(16, 96, 255, 255))
    draw.rounded_rectangle((pad + 20, pad + 20, size - (pad + 20), size - (pad + 20)), radius=40, fill=(255, 255, 255, 18))
    draw.polygon([(72, 116), (128, 70), (184, 116)], fill=(255, 255, 255, 255))
    draw.rounded_rectangle((92, 116, 164, 182), radius=18, fill=(255, 255, 255, 255))
    draw.rounded_rectangle((108, 182, 148, 206), radius=10, fill=(255, 255, 255, 255))
    bolt = [(128, 88), (152, 122), (140, 122), (162, 172), (108, 138), (120, 138), (98, 88)]
    draw.polygon(bolt, fill=(255, 186, 58, 255))
    return image


def make_action_icon(active: bool = False, size: int = 256) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = 18

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_color = (60, 137, 255, 90) if not active else (255, 166, 38, 118)
    glow_draw.ellipse((pad, pad, size - pad, size - pad), fill=glow_color)
    image = Image.alpha_composite(image, glow.filter(ImageFilter.GaussianBlur(10)))

    body = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    body_draw = ImageDraw.Draw(body)
    body_draw.rounded_rectangle((pad + 10, pad + 10, size - (pad + 10), size - (pad + 10)), radius=58, fill=(17, 99, 255, 255))
    body_draw.rounded_rectangle((pad + 24, pad + 24, size - (pad + 24), size - (pad + 24)), radius=40, fill=(255, 255, 255, 18))
    image = Image.alpha_composite(image, body)

    house = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(house)
    hdraw.polygon([(62, 118), (128, 68), (194, 118)], fill=(255, 255, 255, 255))
    hdraw.rounded_rectangle((82, 118, 174, 180), radius=18, fill=(255, 255, 255, 255))
    hdraw.rounded_rectangle((98, 184, 158, 208), radius=10, fill=(255, 255, 255, 255))
    bolt = [(128, 82), (154, 124), (140, 124), (162, 188), (104, 142), (118, 142), (96, 82)]
    hdraw.polygon(bolt, fill=(255, 187, 52, 255) if active else (255, 210, 98, 255))
    image = Image.alpha_composite(image, house)
    return image


def main() -> None:
    plugin_icon = make_plugin_icon(584)
    write_png(plugin_dir / "plugin" / "icon.png", plugin_icon)
    write_png(plugin_dir / "plugin" / "icon@2x.png", plugin_icon.resize((1168, 1168), Image.Resampling.LANCZOS))

    category_icon = make_category_icon(256)
    write_png(plugin_dir / "category" / "icon.png", category_icon)
    write_png(plugin_dir / "category" / "icon@2x.png", category_icon.resize((512, 512), Image.Resampling.LANCZOS))

    for name, active in [("icon", False), ("default", False), ("active", True)]:
        action_icon = make_action_icon(active=active, size=256)
        write_png(plugin_dir / "actions" / "automation" / f"{name}.png", action_icon)

    print("Generated refreshed SmartThings artwork for plugin, category, and action states.")


if __name__ == "__main__":
    main()
