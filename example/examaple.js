require('dotenv').config();
const TinSoftProxy = require('../index');

(async () => {
  try {
    const proxyService = new TinSoftProxy({
      user_api_key: process.env.TINSOFT_USER_API_KEY,
      api_key: process.env.TINSOFT_API_KEY
    });

    proxyService.Stream.on('log', data => console.log('##LOG:', data));

    // const rp = await proxyService.getProxy({
    //   api_key: '',
    //   random: false
    // });

    // const rp = await proxyService.pickupProxy({
    //   api_key: '',
    //   random: false,
    //   location_id: 0
    // });

    const rp = await proxyService.pickup({
      api_key: process.env.TINSOFT_API_KEY || '',
      random: false,
      location_id: 0
    });

    // const rp = await proxyService.changeProxy({
    //   api_key: '',
    //   location_id: 0
    // });

    console.log('rp:', rp);

    const ip = await proxyService.getCurrentIP();
    console.log('currentIP:', ip);
    
  } catch (e) {
    console.log(e);
  }
})();