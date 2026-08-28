#!/usr/bin/env python3
"""Download Unsplash stills into public/images. Network required."""
from pathlib import Path
import urllib.request
import ssl

ROOT = Path("/home/user/north-and-co/public/images")
CTX = ssl.create_default_context()

def url(photo: str, w: int = 1400) -> str:
    return f"https://images.unsplash.com/{photo}?auto=format&fit=crop&w={w}&q=80"


MAP = {
    "banners/hero.jpg": "photo-1441984904996-e0b6ba7ef76e",
    "banners/linen.jpg": "photo-1522771739844-6a9f6d5f14af",
    "banners/lookbook.jpg": "photo-1490481651871-ab68de25d43d",
    "banners/support.jpg": "photo-1556740738-b6a63e27c4df",
    "categories/apparel.jpg": "photo-1445205170230-053f21742cc8",
    "categories/home.jpg": "photo-1616486338812-3dadae4b4ace",
    "categories/beauty.jpg": "photo-1556228578-0d85b1a4d571",
    "categories/accessories.jpg": "photo-1590874103328-eac38a941954",
    "categories/outdoor.jpg": "photo-1551632811-561732d1e306",
    "categories/objects.jpg": "photo-1493934558415-9d19f0b2b4d2",
    "og.jpg": "photo-1441986300917-64674bd600d8",
    "fallback.jpg": "photo-1558591710-4b4a1ae0f04d",
    "products/merino-crewneck.jpg": "photo-1576566588028-4147f3842f27",
    "products/merino-crewneck-2.jpg": "photo-1434389677669-e08b4cac3105",
    "products/washed-oxford-shirt.jpg": "photo-1596755094514-f87e34085b85",
    "products/washed-oxford-shirt-2.jpg": "photo-1602810318383-e386cc2a3ccf",
    "products/wide-leg-trouser.jpg": "photo-1594938298603-c8148c381758",
    "products/wide-leg-trouser-2.jpg": "photo-1506629082955-511b1aa562c8",
    "products/heavyweight-tee.jpg": "photo-1521572163474-6864f9cf17ab",
    "products/heavyweight-tee-2.jpg": "photo-1583743814966-8936f5b7be1a",
    "products/field-jacket.jpg": "photo-1591047139829-d91aecb6caea",
    "products/field-jacket-2.jpg": "photo-1544022613-e87ca75a784a",
    "products/linen-overshirt.jpg": "photo-1594938291221-94f18cbbd0c5",
    "products/linen-overshirt-2.jpg": "photo-1489987707025-afc232f7ea0f",
    "products/cashmere-beanie.jpg": "photo-1576871337632-b9aef4c17ab9",
    "products/cashmere-beanie-2.jpg": "photo-1514327605112-b887c0e61c1a",
    "products/linen-duvet-set.jpg": "photo-1522771739844-6a9f6d5f14af",
    "products/linen-duvet-set-2.jpg": "photo-1631049307264-da0ec9d70304",
    "products/stoneware-set.jpg": "photo-1610701596007-11502861dcfa",
    "products/stoneware-set-2.jpg": "photo-1578749556568-bc2c220d7090",
    "products/wool-throw.jpg": "photo-1555041469-a586c61ea9bc",
    "products/wool-throw-2.jpg": "photo-1540518614846-7eded433c457",
    "products/oak-board.jpg": "photo-1556909114-f6e7ad7d3136",
    "products/oak-board-2.jpg": "photo-1567767292278-a4f21aa2d36e",
    "products/brass-lamp.jpg": "photo-1507473887602-a05c1b3140c5",
    "products/brass-lamp-2.jpg": "photo-1513506003901-1e6a229e2d15",
    "products/pour-over-set.jpg": "photo-1495474472287-4d71bcdd2085",
    "products/pour-over-set-2.jpg": "photo-1511920170031-85601271ffc0",
    "products/linen-napkins.jpg": "photo-1414235077428-338989a2e8c0",
    "products/linen-napkins-2.jpg": "photo-1600565193348-f74bd3c7ccdf",
    "products/bergamot-wash.jpg": "photo-1556228578-0d85b1a4d571",
    "products/bergamot-wash-2.jpg": "photo-1600857544200-b2f666a9a2ec",
    "products/face-oil.jpg": "photo-1620916566398-39f1143ab7be",
    "products/face-oil-2.jpg": "photo-1571875257727-256c39da42af",
    "products/soap-set.jpg": "photo-1600857544200-b2f666a9a2ec",
    "products/soap-set-2.jpg": "photo-1600428853876-fb5a853b82b6",
    "products/daily-spf.jpg": "photo-1556228720-195a672e8a03",
    "products/daily-spf-2.jpg": "photo-1598440947619-2c35fc9aa908",
    "products/leather-belt.jpg": "photo-1624222247344-550fb60583dc",
    "products/leather-belt-2.jpg": "photo-1664289337200-0a4d4d0c1c1c",
    "products/canvas-tote.jpg": "photo-1544816155-12df9643f363",
    "products/canvas-tote-2.jpg": "photo-1590874103328-eac38a941954",
    "products/card-case.jpg": "photo-1627123424574-724758594e93",
    "products/card-case-2.jpg": "photo-1553062407-98eeb64c6a62",
    "products/silk-scarf.jpg": "photo-1584917865442-de89df76afd3",
    "products/silk-scarf-2.jpg": "photo-1601924994987-69e26d50dc26",
    "products/sunglasses.jpg": "photo-1511499767150-a48a237f0083",
    "products/sunglasses-2.jpg": "photo-1572635196237-14b3f281503f",
    "products/daypack.jpg": "photo-1553062407-98eeb64c6a62",
    "products/daypack-2.jpg": "photo-1622560480605-d83c853bc5c3",
    "products/insulated-bottle.jpg": "photo-1602143407151-7111542de6e8",
    "products/insulated-bottle-2.jpg": "photo-1523362628045-1b0b309e2386",
    "products/waxed-duffle.jpg": "photo-1553062407-98eeb64c6a62",
    "products/waxed-duffle-2.jpg": "photo-1581605405669-fdf43688d9c4",
    "products/merino-socks.jpg": "photo-1586350977771-b3b0abd50c40",
    "products/merino-socks-2.jpg": "photo-1585495576986-ea66c101f0db",
    "products/desk-clock.jpg": "photo-1563861826100-9cb868fdbe10",
    "products/desk-clock-2.jpg": "photo-1501139083538-0139583c060f",
    "products/fountain-pen.jpg": "photo-1583485088034-697b5bc36ecd",
    "products/fountain-pen-2.jpg": "photo-1471107340929-a87cd0f5b5f3",
    "products/linen-notebook.jpg": "photo-1531346878377-a5be20888e57",
    "products/linen-notebook-2.jpg": "photo-1517842645767-c639042777db",
    "products/charger-tray.jpg": "photo-1586075010923-2ddab67ba83e",
    "products/charger-tray-2.jpg": "photo-1484704849700-f032a568e944",
    "products/cedar-candle.jpg": "photo-1603006905003-be475098ef06",
    "products/cedar-candle-2.jpg": "photo-1608181831718-0418681c1c2d",
    "products/merino-polo.jpg": "photo-1617137968427-85924c800a22",
    "products/merino-polo-2.jpg": "photo-1586790170083-2f9ceadc732d",
    "products/french-terry-hoodie.jpg": "photo-1556821840-3a63f95609a7",
    "products/french-terry-hoodie-2.jpg": "photo-1620799140408-edc6dcb6d633",
    "products/wool-overcoat.jpg": "photo-1539533018447-63fcf1053308",
    "products/wool-overcoat-2.jpg": "photo-1544923246-77307dd65459",
    "products/cotton-chino.jpg": "photo-1473966968600-fa801b869a1a",
    "products/cotton-chino-2.jpg": "photo-1624378439575-d8705ad7ae80",
    "products/shirt-jacket.jpg": "photo-1594938291221-94f18cbbd0c5",
    "products/shirt-jacket-2.jpg": "photo-1495105787522-155195e0a1d0",
    "products/silk-slip-dress.jpg": "photo-1595777457583-95e059d581b8",
    "products/silk-slip-dress-2.jpg": "photo-1566174053879-31528523f8ae",
    "products/leather-loafer.jpg": "photo-1533867617858-e7fc32599e23",
    "products/leather-loafer-2.jpg": "photo-1614252235316-8c857d38b5f4",
    "products/boiled-wool-scarf.jpg": "photo-1520903920243-00d872a2d1c9",
    "products/boiled-wool-scarf-2.jpg": "photo-1542060748-10c28b62716f",
}

FALLBACK = "photo-1441986300917-64674bd600d8"


def grab(photo: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        url(photo),
        headers={"User-Agent": "Mozilla/5.0 NORTH-AND-CO/1.0"},
    )
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=40) as r:
            data = r.read()
        if len(data) < 2000 or r.headers.get_content_type() not in {"image/jpeg", "image/jpg", "image/png", "binary/octet-stream"}:
            return False
        dest.write_bytes(data)
        return True
    except Exception as e:
        print("fail", dest.name, e)
        return False


ok = 0
for rel, photo in MAP.items():
    dest = ROOT / rel
    if grab(photo, dest):
        ok += 1
        print("ok", rel, dest.stat().st_size)
    elif grab(FALLBACK, dest):
        ok += 1
        print("fallback", rel)
    else:
        print("MISS", rel)
print("done", ok, "/", len(MAP))
