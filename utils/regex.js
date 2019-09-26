/**
 * 正则验证表达式
 */
const numRegex = /^\d*$/ // 纯数字

const letterNumRegex = /^[A-Za-z0-9]+$/ // 字母和数字

const ChineseCharacterRegex = /^[\u4e00-\u9fa5]*$/ // 只能是汉字

const ChineseCharactersRegex = /^[\u4E00-\u9FA5]{2,4}$/ // 只能是2-4位汉子

const decimalsRegex = /^\d+(\.\d{1,2})?$/ // 非零开头的最多带两位小数的数字


/**
 * @author lixiaozhang
 * 正则表达式
 */
// 手机号
const telephoneReg = /^0?(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$/
// 座机号(有无"-"都可以)
const phoneReg = /^0\d{2,3}(-|)[0-9]{4}(-|)[0-9]{3,4}$/
const phoneReg400 = /^400(-|)[0-9]{4}(-|)[0-9]{3}/
const phoneReg800 = /^800(-|)[0-9]{4}(-|)[0-9]{3}/
// 邮箱
const mailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
// 身份证号
const idNoReg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/
// 数字+字母+汉字 + '()' ===> 公司名称、店铺名称、生产厂家
const companyNameReg = /^[\u4E00-\u9FA5A-Za-z0-9\s\(\)\（\）]+$/
// 数字+字母+汉字 + '()' + '-'  ===> 详细地址
const addressReg = /^[\u4E00-\u9FA5A-Za-z0-9\s\(\)\（\）\-]+$/
// 数字+字母+汉字 + '()' + '【】'  ===> 商品名称、商品简介
const productNameReg = /^[\u4E00-\u9FA5A-Za-z0-9\s\(\)\（\）\【\】]+$/
// 无特殊符号的字符串 ===> 法人姓名, 别称, 联系人, 营业范围
const bossNameReg = /^[\u4E00-\u9FA5A-Za-z0-9\s]+$/
// 数字+字母 ===> 商品编码
const productCodeReg = /^[a-zA-Z0-9]+$/;
// 5位整数或小数点后两位 ===> 商品库存、商品价格
const productStockReg5 = /^[0-9]{1,5}([.]{1}[0-9]{0,2})?$/;
// 9位整数或小数点后两位 ===> 商品库存、商品价格
const productStockReg9 = /^[0-9]{1,9}([.]{1}[0-9]{0,2})?$/;

// 纯数字验证
const reNumber = /^[0-9]+(.[0-9]{1,2})?$/;

// 整数验证
const integer = /^[1-9]\d*$/;

// 一位小数
const aDecimal = /^[0-9]+([.][0-9]{1}){0,1}$/;
// 两位位小数
const towADecimal = /^[+-]?[0-9]+(\.[0-9]{1,2})?$/;

module.exports = {
  numRegex,
  letterNumRegex,
  ChineseCharactersRegex,
  ChineseCharacterRegex,
  telephoneReg,
  phoneReg,
  phoneReg400,
  phoneReg800,
  decimalsRegex,
  towADecimal,
  productStockReg5,
  productStockReg9,
  integer,
}