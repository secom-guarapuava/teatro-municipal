"""Reduz as fotos enviadas pelo painel antes de publicar o site.

Fotos de celular chegam com 4 a 8 MB. Aqui elas são giradas na posição certa,
limitadas a 2000 px no lado maior e salvas com boa qualidade e tamanho pequeno.
Roda só na hora da publicação: os arquivos originais continuam no repositório.

Uso: python scripts/otimizar_imagens.py assets/uploads
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

LADO_MAXIMO = 2000


def otimizar(caminho: Path) -> None:
    antes = caminho.stat().st_size
    with Image.open(caminho) as im:
        im = ImageOps.exif_transpose(im)
        im.thumbnail((LADO_MAXIMO, LADO_MAXIMO))
        ext = caminho.suffix.lower()
        if ext in (".jpg", ".jpeg"):
            im.convert("RGB").save(caminho, "JPEG", quality=80, optimize=True, progressive=True)
        elif ext == ".png":
            im.save(caminho, "PNG", optimize=True)
        elif ext == ".webp":
            im.save(caminho, "WEBP", quality=80)
    depois = caminho.stat().st_size
    print(f"{caminho}: {antes // 1024} KB -> {depois // 1024} KB")


def main() -> None:
    pasta = Path(sys.argv[1] if len(sys.argv) > 1 else "assets/uploads")
    if not pasta.exists():
        print(f"Nenhuma pasta {pasta}, nada a fazer.")
        return
    for caminho in sorted(pasta.rglob("*")):
        if caminho.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
            try:
                otimizar(caminho)
            except Exception as erro:  # uma foto com problema não pode travar a publicação
                print(f"Não consegui otimizar {caminho}: {erro}")


if __name__ == "__main__":
    main()
