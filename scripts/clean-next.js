const { rmSync } = require('fs');
const { join } = require('path');

const nextDir = join(__dirname, '..', '.next');
try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('[NEXT] Cleaned .next directory.');
} catch (err) {
  console.warn('[NEXT] Failed to clean .next directory:', err.message);
}
