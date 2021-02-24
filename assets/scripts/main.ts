import Button from './button'
import {wx,initWX} from './common'
import * as common from './common'
import {db} from './wxcloud'
const {ccclass, property} = cc._decorator;
var log=console.log
@ccclass
export default class NewClass extends cc.Component {
    clicked:false
    onLoad () {
        cc.find('delete').on(cc.Node.EventType.TOUCH_END,touch=>{
            db.collection('rooms').remove(common._roomId)
        })
        cc.find('button').getComponent(Button).init('yellow','login',()=>{
            initWX(cc.find('uid').getComponent(cc.EditBox).string)
            common.setUid(cc.find('uid').getComponent(cc.EditBox).string)
            wx.cloud.callFunction({
                name:'server',
                data:{
                    do:'joinRoom',roomId:'999999'
                },
                complete:res=>{log(res)}
            })
            cc.director.loadScene("game")
        })
        cc.find('logUsr').on(cc.Node.EventType.TOUCH_END,res=>{
            // var ls=['1','2','3']
            // ls.map(key=>{
            //     log(db.collection('users').get(key))
            // })
            common.alert('alert',this.node)
        })
    }
}
