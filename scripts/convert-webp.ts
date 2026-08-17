import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'attached_assets', 'generated_images');

async function convert() {
  if (!fs.existsSync(dir)) {
    console.log('Directory not found:', dir);
    return;
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} PNG files to convert.`);

  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace('.png', '.webp'));
    
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
    // Remove original file since user wants to replace them
    fs.unlinkSync(inputPath);
  }
  
  console.log('Done!');
}

convert().catch(console.error);
