#!/usr/bin/env python3
"""Download clothing stills (3 angles each) into public/images/products."""
from pathlib import Path
import urllib.request
import ssl
import shutil

ROOT = Path("/home/user/north-and-co/public/images")
CTX = ssl.create_default_context()


def url(photo: str, w: int = 1400) -> str:
    return f"https://images.unsplash.com/{photo}?auto=format&fit=crop&w={w}&q=80"


# 3 angles per SKU. IDs are Unsplash photo-… filenames.
MAP = {
    "banners/hero.jpg": "photo-1441984904996-e0b6ba7ef76e",
    "banners/linen.jpg": "photo-1487222477894-8943e31ef7b2",
    "banners/lookbook.jpg": "photo-1490481651871-ab68de25d43d",
    "banners/support.jpg": "photo-1556740738-b6a63e27c4df",
    "categories/apparel.jpg": "photo-1445205170230-053f21742cc8",
    "categories/accessories.jpg": "photo-1511499767150-a48a237f0083",
    "og.jpg": "photo-1441986300917-64674bd600d8",
    "fallback.jpg": "photo-1558591710-4b4a1ae0f04d",
    # keepers — extra third angle
    "products/merino-crewneck-3.jpg": "photo-1507680434567-5733c3eb8be7",
    "products/washed-oxford-shirt-3.jpg": "photo-1598032895397-b9472444bf93",
    "products/wide-leg-trouser-3.jpg": "photo-1507676184212-d03ab6a17e40",
    "products/heavyweight-tee-3.jpg": "photo-1503342217505-b0a15ec3261c",
    "products/field-jacket-3.jpg": "photo-1487222477894-8943e31ef7b2",
    "products/linen-overshirt-3.jpg": "photo-1603252109303-2751441dd157",
    "products/cashmere-beanie-3.jpg": "photo-1575428656773-61eee9b4ed89",
    "products/silk-scarf-3.jpg": "photo-1520903920243-00d872a2d1c9",
    "products/merino-polo-3.jpg": "photo-1617137984095-74e4e5e3613f",
    "products/french-terry-hoodie-3.jpg": "photo-1509942776687-72b57ea08e52",
    "products/wool-overcoat-3.jpg": "photo-1542060748-10c28b62716f",
    "products/cotton-chino-3.jpg": "photo-1473966968600-fa801b869a1a",
    "products/shirt-jacket-3.jpg": "photo-1495105787522-155195e0a1d0",
    "products/silk-slip-dress-3.jpg": "photo-1539008835657-9e8e9680c956",
    "products/leather-loafer-3.jpg": "photo-1533867617858-e7fc32599e23",
    "products/boiled-wool-scarf-3.jpg": "photo-1601924994987-69e26d50dc26",
    "products/merino-socks-3.jpg": "photo-1586350977771-b3b0abd50c40",
    "products/leather-belt-3.jpg": "photo-1624222247344-550fb60583dc",
    "products/sunglasses-3.jpg": "photo-1572635196237-14b3f281503f",
    # new clothes
    "products/cashmere-turtleneck.jpg": "photo-1576566588028-4147f3842f27",
    "products/cashmere-turtleneck-2.jpg": "photo-1434389677669-e08b4cac3105",
    "products/cashmere-turtleneck-3.jpg": "photo-1620799140188-3b2a02fd9a77",
    "products/wool-blazer.jpg": "photo-1594938291221-94f18cbbd0c5",
    "products/wool-blazer-2.jpg": "photo-1507676184212-d03ab6a17e40",
    "products/wool-blazer-3.jpg": "photo-1617127365659-c47fa814d70b",
    "products/cable-cardigan.jpg": "photo-1434389677669-e08b4cac3105",
    "products/cable-cardigan-2.jpg": "photo-1507680434567-5733c3eb8be7",
    "products/cable-cardigan-3.jpg": "photo-1620799140408-edc6dcb6d633",
    "products/linen-shirt-dress.jpg": "photo-1496747611176-843222e1e57c",
    "products/linen-shirt-dress-2.jpg": "photo-1515372039744-b8f02a3ae446",
    "products/linen-shirt-dress-3.jpg": "photo-1469334031218-e382a71b716b",
    "products/trench-coat.jpg": "photo-1487222477894-8943e31ef7b2",
    "products/trench-coat-2.jpg": "photo-1539533018447-63fcce6d29b0",
    "products/trench-coat-3.jpg": "photo-1542060748-10c28b62716f",
    "products/silk-blouse.jpg": "photo-1564257631407-4deb1f99d992",
    "products/silk-blouse-2.jpg": "photo-1598033129813-c7605d3e5d3e",
    "products/silk-blouse-3.jpg": "photo-1596755094514-f87e34085b85",
    "products/ribbed-tank.jpg": "photo-1586790170083-2f9ceadc732d",
    "products/ribbed-tank-2.jpg": "photo-1571945153237-4929e783af4a",
    "products/ribbed-tank-3.jpg": "photo-1503342217505-b0a15ec3261c",
    "products/pleated-midi-skirt.jpg": "photo-1583496661160-fb5886a0aaaa",
    "products/pleated-midi-skirt-2.jpg": "photo-1509631179647-0177331693ac",
    "products/pleated-midi-skirt-3.jpg": "photo-1515886657613-9f3515e0c79f",
    "products/wide-leg-jean.jpg": "photo-1541099649105-f69ad21f3246",
    "products/wide-leg-jean-2.jpg": "photo-1542272604-787c3835535d",
    "products/wide-leg-jean-3.jpg": "photo-1582418702052-1109368a59e8",
    "products/cotton-poplin-shirt.jpg": "photo-1598032895397-b9472444bf93",
    "products/cotton-poplin-shirt-2.jpg": "photo-1603252109303-2751441dd157",
    "products/cotton-poplin-shirt-3.jpg": "photo-1602810318383-e386cc2a3ccf",
    "products/seersucker-short.jpg": "photo-1591195853828-11db59a44d6b",
    "products/seersucker-short-2.jpg": "photo-1565084888279-aca607ecce0c",
    "products/seersucker-short-3.jpg": "photo-1506629082955-511b1aa562c8",
    "products/knit-midi-dress.jpg": "photo-1595777457583-95e059d581b8",
    "products/knit-midi-dress-2.jpg": "photo-1539008835657-9e8e9680c956",
    "products/knit-midi-dress-3.jpg": "photo-1515372039744-b8f02a3ae446",
    "products/denim-jacket.jpg": "photo-1551488831-00ddcb6c6bd3",
    "products/denim-jacket-2.jpg": "photo-1576995853123-5a10305d93c0",
    "products/denim-jacket-3.jpg": "photo-1611312449408-fce11157242c",
    "products/merino-sweater-vest.jpg": "photo-1617137968427-85924c800a22",
    "products/merino-sweater-vest-2.jpg": "photo-1617137984095-74e4e5e3613f",
    "products/merino-sweater-vest-3.jpg": "photo-1576566588028-4147f3842f27",
    "products/rugby-shirt.jpg": "photo-1521572163474-6864f9cf17ab",
    "products/rugby-shirt-2.jpg": "photo-1583743814966-8936f5b7be1a",
    "products/rugby-shirt-3.jpg": "photo-1618354691373-d851c5c3a990",
    "products/drawstring-trouser.jpg": "photo-1506629082955-511b1aa562c8",
    "products/drawstring-trouser-2.jpg": "photo-1624378439575-d8705ad7ae80",
    "products/drawstring-trouser-3.jpg": "photo-1473966968600-fa801b869a1a",
    "products/wrap-coat.jpg": "photo-1539533018447-63fcce6d29b0",
    "products/wrap-coat-2.jpg": "photo-1544923246-77307dd65459",
    "products/wrap-coat-3.jpg": "photo-1542060748-10c28b62716f",
    "products/tailored-short.jpg": "photo-1591195853828-11db59a44d6b",
    "products/tailored-short-2.jpg": "photo-1506629082955-511b1aa562c8",
    "products/tailored-short-3.jpg": "photo-1565084888279-aca607ecce0c",
    "products/chambray-work-shirt.jpg": "photo-1495105787522-155195e0a1d0",
    "products/chambray-work-shirt-2.jpg": "photo-1603252109303-2751441dd157",
    "products/chambray-work-shirt-3.jpg": "photo-1596755094514-f87e34085b85",
    "products/pleated-trouser.jpg": "photo-1594938298603-c8148c381758",
    "products/pleated-trouser-2.jpg": "photo-1507676184212-d03ab6a17e40",
    "products/pleated-trouser-3.jpg": "photo-1593032465175-481ac7d21a55",
    "products/suede-overshirt.jpg": "photo-1521223890158-f9f7c3d5d504",
    "products/suede-overshirt-2.jpg": "photo-1551028719-00167b16eac5",
    "products/suede-overshirt-3.jpg": "photo-1591047139829-d91aecb6caea",
}

FALLBACKS = [
    "photo-1441986300917-64674bd600d8",
    "photo-1490481651871-ab68de25d43d",
    "photo-1445205170230-053f21742cc8",
    "photo-1469334031218-e382a71b716b",
    "photo-1552374196-1ab2a1c593e8",
]


def grab(photo: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        url(photo),
        headers={"User-Agent": "Mozilla/5.0 NORTH-AND-CO/1.0"},
    )
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=40) as r:
            data = r.read()
        if len(data) < 2000:
            return False
        dest.write_bytes(data)
        return True
    except Exception as e:
        print("fail", dest.name, e)
        return False


ok = 0
miss = []
for rel, photo in MAP.items():
    dest = ROOT / rel
    if dest.exists() and dest.stat().st_size > 4000 and "products/" in rel and dest.name.endswith("-3.jpg") is False and rel.count("/") == 1:
        # still refresh new clothes
        pass
    if grab(photo, dest):
        ok += 1
        print("ok", rel, dest.stat().st_size)
        continue
    got = False
    for fb in FALLBACKS:
        if grab(fb, dest):
            ok += 1
            print("fallback", rel)
            got = True
            break
    if not got:
        miss.append(rel)
        print("MISS", rel)

# If a product is still missing, copy a nearby clothing file so every SKU has 3 files.
products = ROOT / "products"
needed = []
for p in MAP:
    if p.startswith("products/"):
        needed.append(p)
for rel in needed:
    dest = ROOT / rel
    if dest.exists() and dest.stat().st_size > 2000:
        continue
    donors = sorted(products.glob("*.jpg"), key=lambda x: x.stat().st_size, reverse=True)
    if donors:
        shutil.copyfile(donors[0], dest)
        print("copied", rel, "from", donors[0].name)

print("done", ok, "/", len(MAP), "miss", miss)
