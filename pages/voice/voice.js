import { ajax } from "../../utils/util.js";
const recorderManager = wx.getRecorderManager();

Page({
    data:{
        timerlast:'',
        timeruse:''
    },
    onLoad() {
        let _this = this;
        recorderManager.onStart((res) => {
            console.log('recorder start')
            console.log(res)
            _this.setData({
                timerlast: new Date().getTime()
            })
            let timer = setTimeout(_this.timeing,1000)
        })
        recorderManager.onResume(() => {
            console.log('recorder resume')
        })
        recorderManager.onPause(() => {
            console.log('recorder pause')
        })
        recorderManager.onStop((res) => {
            console.log('recorder stop', res)
            const { tempFilePath } = res
            _this.upLoad(tempFilePath);
            // wx.startRecord({
            //   success: function (res) {
            //     var tempFilePath = res.tempFilePath
            //     wx.playVoice({
            //       filePath: tempFilePath,
            //       complete: function () {
            //       }
            //     })
            //   }
            // });
        })
        recorderManager.onFrameRecorded((res) => {
            const { frameBuffer } = res
            console.log('frameBuffer.byteLength', frameBuffer.byteLength)
        })
    },
    //语音持续时间
    timeing(){
        const _this = this;
        _this.setData({
            timeruse: (new Date().getTime() - _this.data.timerlast)/1000
        })
        console.log((new Date().getTime() - _this.data.timerlast) / 1000)
    },
    voiceFn(){
        const options = {
            duration: 60000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 64000,
            format: 'mp3',
            frameSize: 50
        };
        recorderManager.start(options);
    },
    voiceStopFn (){
        recorderManager.stop();
    },  
    upLoad(tempFilePath){
        console.log(tempFilePath);
        wx.uploadFile({
            // url: 'https://59956412.ngrok.io/uplode/file1',
            // url: 'https://6bbd248f.ngrok.io/upload/mp3',
            url: 'https://55b64293.ngrok.io/baiduAip/vido',
            filePath: tempFilePath,
            name: 'file',
            formData: {
                'user': 'test'
            },
            success: function (res) {
                console.log(res);
                console.log(res.data);
            },
            fail: function (err) {
                console.log(err);
                console.log("语音识别失败");
            }
        })
    }
});