import { createApp } from './app';
import { validateConfig } from './config';
import { routeMounts } from './routers';

const port = 4000;

validateConfig();

const app = createApp(routeMounts);

app.listen(port, () => {
  console.log('api listening on port', port);
});
