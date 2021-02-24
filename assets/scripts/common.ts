import { wxbase } from './wxcloud'
import Alert from './alert'
var log=console.log
export var wx:wxbase=new wxbase(null)

export function initWX(uid){
    wx=new wxbase(uid)
}
export var uid=null
export function setUid(Uid){ uid=Uid}
export var _roomId='999999'

export function doTask(task,complete=null,params=null,roomId=_roomId){
    if(!complete) complete=res=>{ log(task+' done') }
    wx.cloud.callFunction({
        name:'server',complete,
        data:{ roomId, do:task, params },
    })
}

export function alert(text,parent:cc.Node){
    cc.resources.load('alert',cc.Prefab,(err,asset:cc.Prefab)=>{
        var ins=cc.instantiate(asset).getComponent(Alert)
        ins.init(text,parent)
    })
}