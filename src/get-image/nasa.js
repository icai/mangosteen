/* eslint-disable max-len */

const BASEPARAMS = {
    size: 50,
    from: 0,
    sort: 'promo-date-time:desc',
    q: '((ubernode-type:image) AND (routes:1446))',
    _source_include: 'promo-date-time,master-image,nid,title,topics,missions,collections,other-tags,ubernode-type,primary-tag,secondary-tag,cardfeed-title,type,collection-asset-link,link-or-attachment,pr-leader-sentence,image-feature-caption,attachments,uri'
}

const BASEURL = 'https://www.nasa.gov/api/2/ubernode/_search'

const PUBLICURL = 'https://www.nasa.gov/sites/default/files/styles/image_card_4x3_ratio/public/'
const DOWNLOADPUBLICURL = 'https://www.nasa.gov/sites/default/files/'

const axios = require('axios')
// const { imageMinWidth } = require('../utils/config')
const imageMinWidth = 1600

const { CancelToken } = axios
let source = null


// const { axiosGet } = require('../utils/axios')

const axiosGet = function (url, option) {
    option = option || {}
    if (url && typeof url === 'string') {
        option = {
            ...option,
            ...{
                url,
                method: 'get',
            },
        }
    } else {
        option = url
    }
    return new Promise((resolve, reject) => {
        axios.request(option).then(async (result) => {
            if (result.status === 200) {
                resolve(result.data)
            } else {
                reject()
            }
        }).catch((error) => {
            console.log('axiosGet请求出错')
            reject(error)
        })
    })
}

export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
            return
        }
        const baseUrl = BASEURL
        source = CancelToken.source()
        axiosGet({
            url: baseUrl,
            params: {
                ...BASEPARAMS,
                from: (data.page * BASEPARAMS.size)
            },
            cancelToken: source.token
        }).then((result) => {
            source = null

            const { hits: { hits } } = result
            const urls = []

            hits.forEach((item) => {
                const { _source: { 'master-image': imageData } } = item
                const { width, height, uri } = imageData
                const obj = {
                    width,
                    height,
                    url: uri.replace('public://', PUBLICURL),
                    downloadUrl: uri.replace('public://', DOWNLOADPUBLICURL),
                }
                if (parseInt(obj.width, 10) > imageMinWidth){
                    urls.push(obj)
                }
            })
            resolve(urls)
        }).catch((error) => {
            source = null
            console.log('------------请求失败nasa:', error)
            reject()
        })
    })
}

// getImage({
//     page: 0,
//     searchKey: ''
// })

export const cancelImage = function () {
    if (source) {
        source.cancel()
    }
}
