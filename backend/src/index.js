import app from './app.js';
import { config } from './config.js';

const port = config.port || 4000;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
