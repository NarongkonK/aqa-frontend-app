prpl = require('prpl-server');
express = require('express');

const app = express();
app.get('/*', prpl.makeHandler('./build/es5-bundled'));

app.listen(8080);