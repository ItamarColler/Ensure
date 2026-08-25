import express from 'express';

import { api } from './api';

const port = 4000;

const app = express();

app.use(express.json());
app.use('/api', api);

app.listen(port, () => {
  console.log('api listening on port', port);
});
