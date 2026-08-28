from PIL import Image

src_path = r"C:\Users\dassa\.gemini\antigravity-ide\brain\e4af8a2e-0e53-4a7c-ae31-75bec0a7d64d\.user_uploaded\media_1787855783070.png"
img = Image.open(src_path)

# Card image crop coordinates (x1, y1, x2, y2) from the full screenshot
cards = [
    ("rakhi_collection.jpg", (28, 126, 214, 420)),
    ("sharara_sets.jpg", (224, 126, 410, 420)),
    ("ethnic_juttis.jpg", (418, 126, 604, 420)),
    ("kids_ethnic_sets.jpg", (612, 126, 798, 420)),
    ("temple_jewellery.jpg", (806, 126, 992, 420)),
]

for name, box in cards:
    cropped = img.crop(box)
    cropped.convert("RGB").save(f"e:/KSS-E_COMMERCE/KSS-E-COMMERCE-OFFICIAL/frontend/src/assets/new_arrivals/{name}", "JPEG", quality=98)
    print(f"Saved {name} with size {cropped.size}")

print("All 5 cards cropped precisely!")
