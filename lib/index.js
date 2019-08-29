/*!
 * every light and delicate Cache library support expired
 * Supports the use of indexeddb to store data, support setting expiration time, manual failure, cache data grouping
 * @author   walker-lee
 * @license  MIT
 */

const CryptoJS = require('crypto-js')
const localforage = require('localforage')

/*
 * ----------------- 相关工具处理函数----------------
 */

const {toString} = Object.prototype
const isDate = date => toString.call(date) === '[object Date]'
const isNumber = number => typeof number === 'number'

const MAXEXPIREDATE = new Date('Fri, 31 Dec 9999 23:59:59 UTC').getTime()

function _isValidDate (time) {
  return isDate(time) && !isNaN(time.getTime());
}

function _getExpiresDate (expires, now = new Date()) {
  if (isNumber(expires)) {
      expires = expires === Infinity ?
      MAXEXPIREDATE : new Date(now.getTime() + expires)
  } else if (typeof expires === 'string') {
      expires = new Date(expires);
  }
  if (expires && !_isValidDate(expires)) {
      throw new Error('`expires` parameter cannot be converted to a valid Date instance')
  }

  return expires.getTime();
}


function getAesString(data, key, iv){
  const okey  = CryptoJS.enc.Utf8.parse(key);
  const oiv   = CryptoJS.enc.Utf8.parse(iv);
  var encrypted =CryptoJS.AES.encrypt(data, okey,
    {
      iv: oiv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  // 返回的是base64格式的密文
  return encrypted.toString();
}
function getDAesString(encrypted,key,iv){
  const okey  = CryptoJS.enc.Utf8.parse(key);
  const oiv   = CryptoJS.enc.Utf8.parse(iv);
  var decrypted =CryptoJS.AES.decrypt(encrypted, okey,
    {
      iv: oiv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
function getAES(data){
  var key  = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var iv   = '1234567812345678';
  var encrypted = getAesString(data, key, iv);
  return encrypted;
}

function getDAES(data){
  var key  = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var iv   = '1234567812345678';
  var decryptedStr = getDAesString(data, key, iv);
  return decryptedStr;
}

class ElegantStorage {
  // set value
  async set(key, val, options = {}) {
    const {expires, group = 'default', timestamp = Date.now()} = options
    const strVal = typeof val === 'string' ? val : JSON.stringify(val)
    const res = await localforage.setItem(key, {
      c: getAES(strVal),
      t: timestamp,
      e: expires ? _getExpiresDate(expires) : MAXEXPIREDATE,
      g: group,
    })
    await localforage.setItem(`${group}/${key}`, key)
    return res
  }
  // get value
  async get(key, options = {}) {
    const {timestamp} = options
    const cached = await localforage.getItem(key)
    if (cached !== null) {
      const cachedContent = getDAES(cached.c)
      if (timestamp !== undefined && timestamp === cached.t) return JSON.parse(cachedContent)
      if (timestamp === undefined && cached.e - Date.now() > 0) return JSON.parse(cachedContent)
      localforage.removeItem(key)
    }
  }
  // get length
  length() {
    return localforage.length()
  }
  // get keys
  keys() {
    return localforage.keys()
  }
  // remove value
  async remove(key) {
    await localforage.removeItem(key)
    const keys = await localforage.keys()
    const reg = new RegExp(`/${key}$`)
    keys.forEach(k => {
      if(reg.test(k)) localforage.removeItem(k)
    })
  }
  // remove grouped value
  async removeGroup(groupName) {
    const keys = await localforage.keys()
    const reg = new RegExp(`^${groupName}/`)
    const needRemoveGroupKey = keys.filter(k => reg.test(k))
    const needRemoveItemKey = needRemoveGroupKey.map(k => k.replace(reg, ''))
    return Promise.all(
      needRemoveGroupKey.map(k => localforage.removeItem(k))
        .concat(needRemoveItemKey.map(k => localforage.removeItem(k)))
    )
  }
  // remove all
  removeAll() {
    return localforage.clear()
  }
}

module.exports = ElegantStorage