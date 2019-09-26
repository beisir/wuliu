import {
  productStockReg5,
  productStockReg9,
  integer,
} from './regex.js';


/**
 * 货物信息输入验证
 * @param{Object}goodsInfo 货物信息
 * @param{String}type 需要判断的字段key 默认全部判断
 */
const goodsInfoRules = (goodsInfo, type = 'all') => {

  // 货物名称
  if (type === 'all' || type === 'goodsName') {
    if (!goodsInfo.goodsName) return '请输入20字以内的货物名称';
  }

  // 重量 体积
  if (type === 'all' || type === 'goodsWeight' || type === 'goodsVolume') {

    if (goodsInfo.goodsWeight == 0 && goodsInfo.goodsVolume == 0) {

      return '货物重量和体积最少输入一个';

    } else if ((goodsInfo.goodsWeight || 0) != 0 && (goodsInfo.goodsVolume || 0) != 0) {

      if (!productStockReg5.test(goodsInfo.goodsWeight)) return '请输入1~5位正整数,小数点后保留两位的货物重量';
      if (!productStockReg5.test(goodsInfo.goodsVolume)) return '请输入1~5位正整数,小数点后保留两位的货物体积';

    } else {

      if (!productStockReg5.test(goodsInfo.goodsWeight) && !productStockReg5.test(goodsInfo.goodsVolume)) return '请输入1~5位正整数,小数点后保留两位的货物体积或重量';

    }
  }

  // 货物数量
  if (type === 'all' || type === 'goodsNumber') {
    if (!goodsInfo.goodsNumber) return '请填写货物数量';
    if (goodsInfo.goodsNumber === 0) return '货物数量不能为0';
    if (!integer.test(goodsInfo.goodsNumber)) return '请输入1~9位正整数的货物数量';
  }

  // 货物金额
  if (type === 'all' || type === 'goodsAmount') {
    if (!goodsInfo.goodsAmount) return '请填写货物实际金额';
    if (goodsInfo.goodsAmount === 0) return '货物实际金额不能为0';
    if (!productStockReg9.test(goodsInfo.goodsAmount)) return '请输入1~9位正整数,小数点后保留两位的货物金额';
  }

  // 验证通过
  return false
};

module.exports = {
  goodsInfoRules
}