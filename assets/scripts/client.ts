const log=console.log
import * as common from './common'
import Button from './button'
import Game from './game'
const {ccclass, property} = cc._decorator;
var doTask=common.doTask
@ccclass
export default class Client extends cc.Component{
    @property(cc.Prefab)
    btnPre:cc.Prefab=null
    prepareBtn:Button=null
    @property(cc.Label)
    outTxt:cc.Label=null
    @property(Game)
    gameNode:Game=null
    grapBtn:Button=null
    garpPassBtn:Button=null
    outBtn:Button=null
    outPassBtn:Button=null
    dzCards=null
    outStyle={
        type:null,grade:0
    }
    gameState={
        value:'join',onChange:null,res:null,
        set Value(val){
            this.onChange(this.value,val)
            this.value=val
        },
        get Value(){ return this.value}
    }
    private timeto={
        value:-1,res:null,onChange:null,
        set Value(val){
            if(val!=this.value) this.onChange(this.value,val)
            this.value=val
        },
        get Value(){ return this.value}
    }
    private newNode(bias=0,color,text,handler){
        var node:cc.Node=cc.instantiate(this.btnPre)
        node.active=false
        node.x=bias
        this.node.addChild(node)
        node.getComponent(Button).init(color,text,handler)
        return node.getComponent(Button)
    }
    grabBtnsShow(show=null){
        this.grapBtn.node.active=show
        this.garpPassBtn.node.active=show
    }
    outBtnsShow(show=null){
        this.outBtn.node.active=show
        this.outPassBtn.node.active=show
    }
    showTxt(text=null){
        if(!text) this.outTxt.node.active=false
        else {
            this.outTxt.string=text
            this.outTxt.node.active=true
        }
    }
    initBtns(){
        this.prepareBtn=this.newNode(0,'yellow','准备',()=>{
            this.prepareBtn.node.active=false
            this.outTxt.node.active=true
            doTask('prepare')
        })
        this.grapBtn=this.newNode(100,'yellow','抢地主',()=>{
            this.grabBtnsShow(false)
            doTask('grabCard',null,{grab:1})
            this.showTxt('抢地主')
        })
        this.garpPassBtn=this.newNode(-100,'blue','不抢',()=>{
            this.grabBtnsShow(false)
            doTask('grabCard',null,{grab:0})
            this.showTxt('不抢')
        })
        this.outPassBtn=this.newNode(-100,'blue','不出',()=>{
            doTask('playOut',null,{
                uid:common.uid,type:null,value:null,cards:[]
            })
            this.outBtnsShow(false)
            this.showTxt('不出')
        })
        this.outBtn=this.newNode(100,'yellow','出牌',()=>{
            this.gameNode.PlayOut(()=>{
                this.outBtnsShow(false)
            })
        })
    }
    loadJoinPlayer(playersInfo){
        var keyLs=Object.keys(playersInfo)
        this.gameNode.selfPositionIdx=Object.keys(playersInfo).indexOf(common.uid)
        if(this.gameNode.selfPositionIdx<0) return
        keyLs.map((key,idx)=>{
            this.gameNode.initUserInfo(playersInfo[key],idx)
        })
    }
    updateCard(res){
        var keyLs=Object.keys(res.out)
        if(res.lastEffect==common.uid)
            this.outStyle={type:null,grade:-1}
        else
            this.outStyle=res.out[res.lastEffect]
        log(res)
        if(keyLs.indexOf(res.lastOut)==(keyLs.indexOf(common.uid)+1)%3) 
            this.gameNode.updateLeftOut(res.out[res.lastOut].cards,res.players[res.lastOut])
        if(keyLs.indexOf(res.lastOut)==(keyLs.indexOf(common.uid)+2)%3) 
            this.gameNode.updateRightOut(res.out[res.lastOut].cards,res.players[res.lastOut])
    }
    start(){
        this.initBtns()
        setInterval(()=>{
            doTask('listen',res=>{
                if(!res) return
                this.gameState.res=this.timeto.res=res
                cc.find('log').getComponent(cc.Label).string=this.gameState.Value
                this.gameState.Value=res.gameState
                if(res.playersInfo) this.loadJoinPlayer(res.playersInfo)
                if(res.timeto) this.timeto.Value=res.timeto
            })
        },500)
        this.timeto.onChange=(origin,now)=>{
            if(this.gameState.Value=='gaming')
                this.updateCard(this.timeto.res)
            if(now==common.uid){
                this.showTxt(false)
                if(this.gameState.Value=='grab'){
                    // this.grabBtnsShow(true)
                    //测试
                    this.grabBtnsShow(false)
                    doTask('grabCard',null,{grab:1})
                }
                else if(this.gameState.Value=='gaming'){
                    this.outBtnsShow(true)
                    this.gameNode.clearOut()
                    this.gameNode.chooseIdxs=[]
                }
                else{
                    
                }
            }
        }
        this.gameState.onChange=(origin,now)=>{
            if(origin=='join' && now=='prepare') {
                log('----------full----------')
                
                // this.prepareBtn.node.active=true
                //测试
                this.outTxt.node.active=true
                doTask('prepare')
            }
            if(origin=='prepare' && now=='get') {
                log('----------发牌----------')
                this.showTxt(false)
                this.gameNode.initHandCards(this.gameState.res.hand[common.uid])
                this.dzCards=this.gameState.res.dzcards
                doTask('prepareCard')
            }
            if(origin=='get' && now=='grab'){
                log('----------抢地主----------')
            }
            if(origin=='grab' && now=='gaming'){
                log('----------游戏开始----------')
                this.showTxt(false)
                setTimeout(()=>{
                    if(this.timeto.Value==common.uid)
                        this.gameNode.addDzcards(this.dzCards)
                    this.gameNode.showDzcards(this.dzCards)
                },800)
            }
            if(origin=='gaming' && now=='end'){
                log('game end')
            }
        }
    }
}

