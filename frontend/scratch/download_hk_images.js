import fs from 'fs';
import https from 'https';
import path from 'path';

const imagesToDownload = [
  {
    file: 'hk_mixer_grinder.jpg',
    url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80', // Blender / mixer appliance studio shot
  },
  {
    file: 'hk_cotton_bedsheet.jpg',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', // Luxury clean bedsheet
  },
  {
    file: 'hk_casserole_set.jpg',
    url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80', // Stainless steel cookware / hotpot
  },
  {
    file: 'hk_ceramic_dinner_set.jpg',
    url: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80', // Ceramic plates and dinnerware set
  },
  {
    file: 'hk_wall_shelves.jpg',
    url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80', // Wooden floating shelves
  }
];

const targetDir = 'c:\\Users\\HP\\Desktop\\BuyZo\\frontend\\src\\assets\\images';

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const item of imagesToDownload) {
    const dest = path.join(targetDir, item.file);
    console.log(`Downloading ${item.file}...`);
    try {
      await download(item.url, dest);
      console.log(`Successfully saved ${item.file}`);
    } catch (e) {
      console.error(`Failed ${item.file}:`, e.message);
    }
  }
}

run();
