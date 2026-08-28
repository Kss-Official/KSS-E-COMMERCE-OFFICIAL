from PIL import Image

src_path = r"C:\Users\dassa\.gemini\antigravity-ide\brain\e4af8a2e-0e53-4a7c-ae31-75bec0a7d64d\.user_uploaded\media_1787855783070.png"
dest_path = r"e:\KSS-E_COMMERCE\KSS-E-COMMERCE-OFFICIAL\frontend\src\assets\new_arrivals\temple_jewellery.jpg"

img = Image.open(src_path)
w, h = img.size
print("Source image dimensions:", w, h)

# Card 5 image is located around 78% to 97% of width and 22% to 76% of height
card5_box = (int(w * 0.785), int(h * 0.22), int(w * 0.965), int(h * 0.76))
card5_img = img.crop(card5_box)
card5_img.convert("RGB").save(dest_path, "JPEG", quality=95)
print("Saved temple_jewellery.jpg successfully!")
