const axios = require('axios');
const stream = require('stream');
const request = require('request');
const BPromise = require("bluebird");
const { get, sample } = require('lodash');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");

class ProxyServiceError extends Error {
  constructor(message) {
    super(message);
   // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
   // This clips the constructor invocation from the stack trace.
   // It's not absolutely essential, but it does make the stack trace a little nicer.
   //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

class TinSoftProxy {
  constructor(options = {}) {
    this.Stream = new stream.Stream();

    this.user_api_key = get(options, 'user_api_key', '');
    this.api_key = get(options, 'api_key', '');

    this.apiEndpoint = 'http://proxy.tinsoftsv.com';
    this.requestTimeout = 20000;
    this.service = axios.create({
      baseURL: this.apiEndpoint,
      timeout: this.requestTimeout,
    });

    this.proxy = '';
    this.waitProxyLiveTimeout = 30000;

    // Request intercepter
    this.service.interceptors.request.use(
      (config) => {
        const newConfig = config;
        if (Object.prototype.hasOwnProperty.call(newConfig, 'params')) {
          if (!newConfig.params.key) newConfig.params.key = this.user_api_key || this.api_key;
        } else {
          newConfig.params = {
            key: this.user_api_key || this.api_key,
          };
        }
        return newConfig;
      },
      (error) => {
        Promise.reject(error);
      },
    );

    // response pre-processing
    this.service.interceptors.response.use(
      (response) => {
        // const data = get(response, 'data', {});
        const rpSuccess = get(response, 'data.success', false);
        const rpMessage = get(response, 'data.description', 'Không có thông tin từ server.');
        if (rpSuccess === false) {
          return Promise.reject(new ProxyServiceError(`${rpMessage}`));
        }
        return get(response, 'data.data', get(response, 'data', {}));
      },
      (error) => Promise.reject(new ProxyServiceError(error)),
    );

  }

  isAdmin() {
    if (!this.user_api_key) throw new Error('Pls input user_api_key');
  }

  rp_custom(options = {}) {
    return new Promise((resolve, reject) => {
      const proxyOption = (this.proxy !== '') ? { proxy: `http://${this.proxy}` } : {};

      const requestOptions = {
        timeout: this.requestTimeout,
        ...options,
        ...proxyOption
      };

      request(requestOptions, (error, response, body) => {
        const requestURL = get(requestOptions, 'url', '');
        const statusCode = get(response, 'statusCode', '');
        if (!error && statusCode == 200) {
          resolve(response);
        } else if (error && !statusCode) {
          reject(error);
        } else {
          reject(new Error(`Request failed with statusCode: ${statusCode}, requestURL: ${requestURL}`));
        }
      });
    });
  }

  async ipconfig() {
    const response = await this.rp_custom({
      url: 'http://ipconfig.top/api/ip',
      method: 'get',
      json: true,
      time : true,
      timeout: 2000,
    });
    const elapsedTime = get(response, 'elapsedTime', -1);
    const currentIP = get(response, 'body.data.ip');
    const ipInfo = get(response, 'body.data', {});
    ipInfo['speed'] = elapsedTime;
    ipInfo['service'] = 'ipconfig.top';
    this.Stream.emit('log', `Current IP: ${currentIP}, Speed: ${elapsedTime}ms`);
    return ipInfo;
  }

  async amazonIP() {
    const response = await this.rp_custom({
      url: 'http://checkip.amazonaws.com',
      method: 'get',
      time : true,
      timeout: 2000,
    });
    const elapsedTime = get(response, 'elapsedTime', -1);
    const currentIP = get(response, 'body', '').trim();
    const ipInfo = { ip: currentIP };
    ipInfo['speed'] = elapsedTime;
    ipInfo['service'] = 'checkip.amazonaws.com';
    this.Stream.emit('log', `Current IP: ${currentIP}, Speed: ${elapsedTime}ms`);
    return ipInfo;
  }

  async FPTIP() {
    const response = await this.rp_custom({
      url: 'https://checkip.fptplay.net',
      method: 'get',
      time : true,
      timeout: 2000,
    });
    const elapsedTime = get(response, 'elapsedTime', -1);
    const currentIP = get(response, 'body', '').trim();
    const ipInfo = { ip: currentIP };
    ipInfo['speed'] = elapsedTime;
    ipInfo['service'] = 'checkip.fptplay.net';
    this.Stream.emit('log', `Current IP: ${currentIP}, Speed: ${elapsedTime}ms`);
    return ipInfo;
  }

  async getCurrentIP() {
    var result = {}
    try {
      result = await this.ipconfig();;
    } catch (e) {
      result = await this.amazonIP();;
    } finally {
      return result;
    }
  }

  async userInfo() {
    this.isAdmin();
    const rps = await this.service.request({
      url: '/api/getUserInfo.php',
      method: 'get',
    });
    return rps;
  }

  async balance() {
    this.isAdmin();
    const rps = await this.service.request({
      url: '/api/getUserInfo.php',
      method: 'get',
    });
    return parseInt(`${get(rps, 'balance', 0)}`);
  }

  async userKeys() {
    this.isAdmin();
    const rps = await this.service.request({
      url: '/api/getUserKeys.php',
      method: 'get',
    });
    rps.map(item => {
      const date_expired = get(item, 'date_expired');
      if (!date_expired) throw new Error('user keys is wrong struct');

      item.expireAt = moment(date_expired, 'DD-MM-YYYY HH:mm:ss');
      item.isExp = () => !item.expireAt.isAfter(moment(Date.now()));
      return item;
    })
    return rps;
  }

  async keyInfo(api_key) {
    const rps = await this.service.request({
      url: '/api/getKeyInfo.php',
      method: 'get',
      params: { key: api_key || this.api_key }
    });
    return rps;
  }

  async getLocations() {
    const rps = await this.service.request({
      url: '/api/getLocations.php',
      method: 'get'
    });
    return rps;
  }

  async getProxy(options = {}) {
    const api_key = get(options, 'api_key', '');
    const random = get(options, 'random', true);

    let ranDomKey = '';
    if (random) {
      const currentUserKeys = await this.userKeys();
      const availableKeys = currentUserKeys.filter(item => !item.isExp());

      if (availableKeys.length === 0) throw new Error('Do not have any key exp');
      const pickupRandomKey = sample(availableKeys);
      ranDomKey = get(pickupRandomKey, 'key', '');
    }
    
    const key = ranDomKey || api_key || this.api_key;
    const rps = await this.service.request({
      url: '/api/getProxy.php',
      method: 'get',
      params: { key }
    });

    const proxy = get(rps, 'proxy', '');
    this.Stream.emit('log', `Got proxy: ${proxy}, api_key: ${key}`);

    return { ...rps, api_key: key };
  }

  async changeProxy(options = {}) {
    const api_key = get(options, 'api_key', '');
    const location_id = get(options, 'api_key', '0');

    if (!api_key && !this.api_key) throw new Error('Pls input api_key');
    
    const key = api_key || this.api_key;
    const rps = await this.service.request({
      url: '/api/changeProxy.php',
      method: 'get',
      params: {  key, location: `${location_id}` }
    });

    const proxy = get(rps, 'proxy', '');
    this.Stream.emit('log', `Changed proxy: ${proxy}, api_key: ${key}`);

    return { ...rps, api_key: key };
    // {
    //   success: true,
    //   proxy: '171.229.89.231:20400',
    //   location: '2',
    //   next_change: '120',
    //   timeout: 1188
    // }
  }

  async waitUntilProxyOK(startTime = Date.now()) {
    try {
      const ipResult = await this.getCurrentIP();
      return ipResult;
    } catch (e) {
      if (e.message.includes('ECONNREFUSED')) {
        const passTime = Date.now() - startTime;
        if (passTime >= this.waitProxyLiveTimeout) throw e;
        this.Stream.emit('log', `Waited ${passTime}ms until proxy ready`);
        return this.waitUntilProxyOK(startTime);
      }
      throw e;
    }
  }

  async changeIP(options = {}) {
    let result = { isChanged: false, message: '' };
    const currentProxy = await this.pickupProxy(options);
    const next_change = get(currentProxy, 'next_change', -1);
    if (next_change === 0) {
      await this.changeProxy(options);
      result.isChanged = true;
    } else {
      if (next_change === 120) {
        // await BPromise.delay(150);
        result.isChanged = true;
      }
      result.message = `Wait ${next_change}s`;
    };
    const changedProxy = await this.pickupProxy(options);

    result = { ...result, ...changedProxy};

    this.proxy = get(result, 'proxy', this.proxy);

    if (result.isChanged) await this.waitUntilProxyOK();

    return result;

  }

  async pickup(options = {}) {
    let result = { isChanged: false, message: '' };

    let api_key = get(options, 'api_key', '');
    const location_id = get(options, 'api_key', '0');
    const random = (api_key === '');

    if (!api_key && random) {
      const currentUserKeys = await this.userKeys();
      const availableKeys = currentUserKeys.filter(item => !item.isExp());

      if (availableKeys.length === 0) throw new Error('Do not have any key exp');
      const pickupRandomKey = sample(availableKeys);
      api_key = get(pickupRandomKey, 'key', '');
      this.Stream.emit('log', `Pickup api_key: ${api_key}`);
    }

    try {
      result = await this.getProxy({ api_key, random: false });
    } catch (e) {
      if (e.name === 'ProxyServiceError' && e.message.includes('proxy not found!')) {
        await this.changeProxy({ api_key, location_id });
        result = await this.getProxy({ api_key, random: false });
        result.isChanged = true;
      } else {
        throw e;
      }
    }

    let next_change = get(result, 'next_change', -1);
    if (next_change === 0) {
      await this.changeProxy({ api_key, location_id });
      result = await this.getProxy({ api_key, random: false });
      result.isChanged = true;

    } else if (next_change === 120) {
      result.isChanged = true;
    };

    next_change = get(result, 'next_change', -1);
    result.message = `Wait ${next_change}s`;

    this.proxy = get(result, 'proxy', this.proxy);

    if (result.isChanged) await this.waitUntilProxyOK();

    return result;

  }

  async pickupProxy(options = {}) {
    const api_key = get(options, 'api_key', '');
    const location_id = get(options, 'api_key', '0');
    const random = get(options, 'random', false);
    let result = {};
    try {
      result = await this.getProxy(options);
    } catch (e) {
      await this.changeProxy(options);
      result = await this.getProxy(options);
    }
    return result;
  }

  
}

module.exports = TinSoftProxy;
