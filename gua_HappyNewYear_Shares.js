/*

2022新春快乐 击鼓助力

账号内互助

每人2次助力机会 助力满需要5次

cron:15 10,22 1-14 2 *

15 10,22 1-14 2 *  https://raw.githubusercontent.com/smiek2121/scripts/master/gua_HappyNewYear_Shares.js

*/

const $ = new Env('2022新春快乐 击鼓助力');

const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

const notify = $.isNode() ? require('./sendNotify') : '';

CryptoScripts()

$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;

//IOS等用户直接用NobyDa的jd cookie

let cookiesArr = [],

    cookie = '';

if ($.isNode()) {

  Object.keys(jdCookieNode).forEach((item) => {

    cookiesArr.push(jdCookieNode[item])

  })

  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};

} else {

  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);

}

message = ''

newCookie = ''

resMsg = ''

$.endFlag = false

let shareCodeArr = {}

$.runArr = {}

const activeEndTime = '2022/02/15 00:00:00+08:00';//活动结束时间

let nowTime = new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000;

let timeH = $.time('H')

!(async () => {

  if (!cookiesArr[0]) {

    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {

      "open-url": "https://bean.m.jd.com/"

    });

    return;

  }

  if (nowTime > new Date(activeEndTime).getTime()) {

    //活动结束后弹窗提醒

    $.msg($.name, '活动已结束', `请删除此脚本\n咱江湖再见`);

    return

  }

  $.temp = [];

  for (let i = 0; i < cookiesArr.length; i++) {

    cookie = cookiesArr[i];

    if (cookie) {

      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])

      $.index = i + 1;

      console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);

      await getUA()

      await run();

    }

  }

  try{

    for (let i = 0; i < cookiesArr.length && $.temp.length > 0 && true; i++) {

      if (cookiesArr[i]) {

        cookie = cookiesArr[i];

        $.canHelp = true;//能否助力

        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])

        console.log(`\n账号内部相互邀请助力\n`);

        for (let n in $.temp) {

          let item = $.temp[n]

          if(!item || !$.canHelp) continue

          console.log(`\n${$.UserName} 去参助力 ${item}`);

          const helpRes = await getCoupons(item.trim());

          let res = $.toObj(helpRes,helpRes)

          if(typeof res == 'object'){

            if(res.code == 0 && res.data){

              if(res.data.bizMsg){

                console.log(res.data.bizMsg)

              }

              if(res.data.bizCode === -106){

                delete $.temp[n]

              }else if([-105,-1001].includes(res.data.bizCode)){

                $.canHelp = false

              }

            }else if([-30001].includes(res.code)){

              $.canHelp = false

            }else if(res.message || res.msg){

              console.log(res.message || res.msg)

            }

          }

          await $.wait(parseInt(Math.random() * 2000 + 3000, 10))

          if(!$.canHelp){

            break

          }

        }

        

      }

    }

  }catch(e){

    console.log(e)

  }

})()

    .catch((e) => $.logErr(e))

    .finally(() => $.done())

async function run(type = 0){

  try{

    resMsg = ''

    let res = await showCoupon()

    if($.endFlag) return

    if(resMsg){

      message += `【京东账号${$.index}】${$.nickName || $.UserName}\n${resMsg}`

    }

    await $.wait(parseInt(Math.random() * 2000 + 3000, 10))

  }catch(e){

    console.log(e)

  }

}

function getCoupons(code = '') {

  

  return new Promise(async resolve => {

    await requestAlgo();

    let time = Date.now()

    let body = {"inviteCode":code,"uuid":"","sv":""}

    let h5st = h5stSign(body) || 'undefined'

    let message = ''

    let opts = {

      url: `https://api-x.m.jd.com/client.action`,

      body: `h5st=${h5st}&functionId=party_rt_assist&body=${$.toStr(body,body)}&client=wh5&clientVersion=1.0.0&appid=o2_act&t=${time}`,

      headers: {

        "Accept": "application/json",

        "Accept-Language": "zh-cn",

        "Accept-Encoding": "gzip, deflate, br",

        "Accept-Type": "application/x-www-form-urlencoded",

        'Cookie': `${cookie}`,

        "Origin": "https://sfgala.jd.com",

        "Referer": "https://sfgala.jd.com/",

        "User-Agent": $.UA ,

      }

    }

    $.post(opts, async (err, resp, data) => {

      try {

        if (err) {

          console.log(`${$.toStr(err)}`)

          console.log(`${$.name} API请求失败，请检查网路重试`)

        } else {

          console.log(data)

        }

      } catch (e) {

        $.logErr(e, resp)

      } finally {

        resolve(data);

      }

    })

  })

}

function showCoupon() {

  let msg = true

  return new Promise(resolve => {

    let body = {"showAssistorsSwitch":true}

    let opts = {

      url: `https://api-x.m.jd.com/client.action`,

      body: `functionId=party_rt_inviteWindow&body=${$.toStr(body,body)}&client=wh5&clientVersion=1.0.0&
