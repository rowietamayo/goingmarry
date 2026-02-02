
import { uploadToCloudinary } from '../services/cloudinary';

async function testUpload() {
    console.log('Testing Cloudinary Upload...');
    // Small base64 red dot
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    try {
        const url = await uploadToCloudinary(base64);
        console.log('Upload success:', url);
    } catch (e) {
        console.error('Upload failed:', e);
    }
}
testUpload();
