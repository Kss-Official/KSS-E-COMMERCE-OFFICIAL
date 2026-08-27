from PIL import Image

src_path = r"C:\Users\dassa\.gemini\antigravity-ide\brain\712bbeed-cdb6-4cb7-9811-ebc6b9703d27\.user_uploaded\media_1787809107601.jpg"
dst_path_backend = r"e:\KSS-E_COMMERCE\KSS-E-COMMERCE-OFFICIAL\backend\media\categories\sports_fitness.png"
dst_path_frontend_cat = r"e:\KSS-E_COMMERCE\KSS-E-COMMERCE-OFFICIAL\frontend\src\assets\category\sports_fitness.png"
dst_path_frontend_img = r"e:\KSS-E_COMMERCE\KSS-E-COMMERCE-OFFICIAL\frontend\src\assets\images\sports_fitness.png"

img = Image.open(src_path).convert("RGBA")
datas = img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata()

newData = []
for item in datas:
    # Change dark background pixels to transparent
    if item[0] < 28 and item[1] < 28 and item[2] < 28:
        newData.append((0, 0, 0, 0))
    else:
        newData.append(item)

img.putdata(newData)
img.save(dst_path_backend, "PNG")
img.save(dst_path_frontend_cat, "PNG")
img.save(dst_path_frontend_img, "PNG")
print("Sports & Fitness transparent PNG converted and saved successfully!")
