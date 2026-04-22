const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\fb37c13c-d2b4-49c7-804d-31bcae68295a\\media__1775641125689.jpg";
const dest = path.join(__dirname, 'public', 'login-bg.png');

try {
    fs.copyFileSync(src, dest);
    console.log('Successfully copied background image to ' + dest);
} catch (err) {
    console.error('Error copying image:', err);
    process.exit(1);
}
