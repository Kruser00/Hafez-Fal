import fs from 'fs';
import path from 'path';

const poems = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop"
  }
];

async function downloadImage(poem) {
  try {
    console.log(`Downloading image for poem ${poem.id}...`);
    const response = await fetch(poem.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const filePath = path.join(process.cwd(), 'public', 'images', `poem-${poem.id}.jpg`);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved image to ${filePath}`);
  } catch (error) {
    console.error(`Error downloading image for poem ${poem.id}:`, error);
  }
}

async function main() {
  for (const poem of poems) {
    await downloadImage(poem);
  }
}

main();
