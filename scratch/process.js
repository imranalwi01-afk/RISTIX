const Jimp = require('jimp');

async function processLogo() {
  try {
    const image = await Jimp.read('d:/RISTIX/packages/frontend/public/images/logo-ristix-pro.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If white, make transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha to 0
      } 
      // If dark blue/black (the 'RISTIX' text and dark parts of owl), invert to white
      else if (red < 100 && green < 100 && blue < 150) {
        // Change to pure white for better contrast on dark sidebar
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
      }
    });

    await image.writeAsync('d:/RISTIX/packages/frontend/public/images/logo-ristix-pro-transparent.png');
    console.log('Successfully processed logo');
  } catch (err) {
    console.error('Error processing logo:', err);
  }
}

processLogo();
