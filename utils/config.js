const hostname = 'https://wsprod.hc360.com';
module.exports = {
    app: {
      weixin: `/wxlogistics/smallpro/user/get/openId.html`
    },
    index_page: {
        prodbytime: `${hostname}/get/prodbytime?pageSize=10&pageNo=`,
    },
    classy: {
        prodcategory: `${hostname}/get/prodcategory`
    },
    search_listPath: {
        prodbycat: `${hostname}/get/prodbycat?pageSize=6`,
        prodbytitle: `${hostname}/get/prodbytitle?pageSize=6`,
        prodbysupid: `${hostname}/get/prodbysupid?pageSize=10`
    },
    detail: {
        prodinfo: `${hostname}/get/prodinfo`,
        distribut: `${hostname}/distribut/save`
    },
    distribution: {
        getByOpenid: `${hostname}/distribut/getByOpenid`
    },
    errImg: 'https://style.org.hc360.com/images/microMall/program/proGimg.png'
    
}