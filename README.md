# [tinsoftproxy](https://tinsoftproxy.com)

Nhằm hỗ trợ việc sử dụng proxy một cách nhanh chóng và đơn giản. Chỉ cần gọi 1 hàm duy nhất để có được proxy không phải thao tác request quá nhiều.

## Installation

Via npm:
```sh
npm i -S tinsoftproxy
```

Update via npm:
```sh
npm update tinsoftproxy
```

## Usage

```js
const TinSoftProxy = require('tinsoftproxy');

(async () => {
  try {
    const proxyService = new TinSoftProxy({
      user_api_key: 'TINSOFT_USER_API_KEY'
    });

    proxyService.Stream.on('log', data => console.log('##LOG:', data));

    const rp = await proxyService.pickup({
      api_key: process.env.TINSOFT_API_KEY || '',
      location_id: 0
    });

    console.log('rp:', rp);
    // {
    //   isChanged: false,
    //   message: 'Wait 119s',
    //   success: true,
    //   proxy: '116.107.60.32:54877',
    //   location: '15',
    //   next_change: 119,
    //   timeout: 1185,
    //   api_key: 'api_key dùng để get proxy'
    // }
    
  } catch (e) {
    console.log(e);
  }
})();
```

## API
### TinSoftProxy([options])
- `options` <[Object]>
  - `user_api_key` <[string]>: **(require)** Là api được lấy trong mục [profile](https://tinsoftproxy.com/?page=profile)

- return <[Object]>

### .pickup([options])
- `options` <[Object]>
  - `api_key` <[string]> **(option)** Chỉ định api_key cần get proxy, hoặc để trống thì mạc định thư viện sẽ tự động chọn key
  - `location_id` <[Number]> `Default: 0` ID Location. [Danh sách tại đây](http://proxy.tinsoftsv.com/api/getLocations.php)

- return <[Object]>
  - `isChanged` <[boolean]> Proxy IP có sự thay đổi, `true` là có sự thay đổi
  - `proxy` <[string]> Thông tin proxy
  - `next_change` <[Number]> Thời gian đợi cho đến lần thay IP tiếp theo (giây)
  - `timeout` <[Number]> Có thể xem như là tốc độ của proxy (càng thấp càng nhanh)
  - `location` <[Number]|[string]> ID địa chỉ địa lý của IP. [Danh sách tại đây](http://proxy.tinsoftsv.com/api/getLocations.php)
  - Example:
    ```js
    {
      isChanged: false,
      message: 'Wait 119s',
      success: true,
      proxy: '116.107.60.32:54877',
      location: '15',
      next_change: 119,
      timeout: 1185,
      api_key: 'api_key dùng để get proxy'
    }
    ```

## [TinsoftAPI Document](https://tinsoftproxy.com/api/document_vi.php)

## Author

👤 **[Văn Tài](https://nguyenvantai.vn)**

- Twitter: [@mrluaf](https://twitter.com/mrluaf)
- Facebook: [@LuaAcoustic](https://www.facebook.com/LuaAcoustic)
- Github: [@mrluaf](https://github.com/mrluaf)
- Gitlab: [@mrluaf](https://gitlab.com/mrluaf)

---

Made with ❤️ by [Văn Tài](https://nguyenvantai.vn)

[axnode]: #accessibilitysnapshotoptions 'AXNode'
[accessibility]: #class-accessibility 'Accessibility'
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array 'Array'
[body]: #class-body 'Body'
[browsercontext]: #class-browsercontext 'BrowserContext'
[browserfetcher]: #class-browserfetcher 'BrowserFetcher'
[browser]: #class-browser 'Browser'
[buffer]: https://nodejs.org/api/buffer.html#buffer_class_buffer 'Buffer'
[cdpsession]: #class-cdpsession 'CDPSession'
[childprocess]: https://nodejs.org/api/child_process.html 'ChildProcess'
[connectiontransport]: ../src/WebSocketTransport.js 'ConnectionTransport'
[consolemessage]: #class-consolemessage 'ConsoleMessage'
[coverage]: #class-coverage 'Coverage'
[dialog]: #class-dialog 'Dialog'
[elementhandle]: #class-elementhandle 'ElementHandle'
[element]: https://developer.mozilla.org/en-US/docs/Web/API/element 'Element'
[error]: https://nodejs.org/api/errors.html#errors_class_error 'Error'
[executioncontext]: #class-executioncontext 'ExecutionContext'
[filechooser]: #class-filechooser 'FileChooser'
[frame]: #class-frame 'Frame'
[jshandle]: #class-jshandle 'JSHandle'
[keyboard]: #class-keyboard 'Keyboard'
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map 'Map'
[mouse]: #class-mouse 'Mouse'
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object 'Object'
[page]: #class-page 'Page'
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise 'Promise'
[httprequest]: #class-httprequest 'HTTPRequest'
[httpresponse]: #class-httpresponse 'HTTPResponse'
[securitydetails]: #class-securitydetails 'SecurityDetails'
[serializable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Description 'Serializable'
[target]: #class-target 'Target'
[timeouterror]: #class-timeouterror 'TimeoutError'
[touchscreen]: #class-touchscreen 'Touchscreen'
[tracing]: #class-tracing 'Tracing'
[uievent.detail]: https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail 'UIEvent.detail'
[uskeyboardlayout]: ../src/common/USKeyboardLayout.ts 'USKeyboardLayout'
[unixtime]: https://en.wikipedia.org/wiki/Unix_time 'Unix Time'
[webworker]: #class-webworker 'Worker'
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type 'Boolean'
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function 'Function'
[iterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols 'Iterator'
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type 'Number'
[origin]: https://developer.mozilla.org/en-US/docs/Glossary/Origin 'Origin'
[selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors 'selector'
[stream.readable]: https://nodejs.org/api/stream.html#stream_class_stream_readable 'stream.Readable'
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type 'String'
[symbol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Symbol_type 'Symbol'
[xpath]: https://developer.mozilla.org/en-US/docs/Web/XPath 'xpath'
[customqueryhandler]: #interface-customqueryhandler 'CustomQueryHandler'