import express from 'express';

import { createApi } from './api';
import { validateConfig } from './config';
import { routeMounts } from './routers';

const port = 4000;

validateConfig();

const app = express();

app.use(express.json());
app.use('/api', createApi(routeMounts));

app.listen(port, () => {
  console.log('api listening on port', port);
});
