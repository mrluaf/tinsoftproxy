require('dotenv').config();
const TinSoftProxy = require('../index');
const request = require('request');
var ProxyAgent = require('proxy-agent');

const proxyService = new TinSoftProxy({
  user_api_key: process.env.TINSOFT_USER_API_KEY,
});

proxyService.pickup({
  api_key: process.env.TINSOFT_API_KEY || '',
  location_id: 0
}).then(rp => {
  console.log('rp:', rp);
  const proxyUri = `http://${rp.proxy}`

  const agent = new ProxyAgent(proxyUri)

  request({
    timeout: 3000,
    url: 'http://ipconfig.top/api/ip',
    json: true,
    // proxy: proxyUri,
    agent
  }, (err, res, body) => {
    if (!err) {
      console.log(body);
    } else {
      console.log(err);
    }
  })
});
