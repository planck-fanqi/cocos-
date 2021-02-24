import * as _ from 'lodash'
import Card from './card'
import * as puke from './pukeData'
import Client from './client'
import * as common from  './common'
import {db} from './wxcloud'
const {ccclass, property} = cc._decorator;
var log=console.log
var doTask=common.doTask
@ccclass
export default class Game extends cc.Component {

    @property(cc.Prefab)
    cardPre: cc.Prefab=null;
    @property(cc.Prefab)
    userPre: cc.Prefab=null

    handCards:Array<Card>=[];
    outCards:Array<Card>=[];
    rightOutCard:Array<Card>=[];
    leftOutCard:Array<Card>=[];
    dzCard:Array<Card>=[];
    @property(cc.Node)
    rightCardsAnchor:cc.Node=null
    @property(cc.Node)
    leftCardsAnchor:cc.Node=null
    @property(cc.Node)
    handCardsAnchor:cc.Node=null
    @property(cc.Node)
    outCardsAnchor:cc.Node=null
    @property(cc.Node)
    buttonAnchor:cc.Node=null
    @property(cc.Node)
    dzCardAnchor:cc.Node=null
    @property(cc.Node)
    leftCntLeft:cc.Node=null
    @property(cc.Node)
    leftCntRight:cc.Node=null
    userInfoLoad={
        left:false,right:false,center:false
    }
    shuffleCards=[]
    private selectCnt={
        Value:null, onChange:null,
        set value(val){
            if(this.onChange && val!=this.Value) this.onChange(val,this.Value);
            this.Value=val;
        },
        get value(){ return this.Value }
    }
    selectStartIdx=null
    chooseIdxs=[]

    onLoad () {
        // cc.find('Canvas').on(cc.Node.EventType.TOUCH_END,(e:cc.Touch)=>{
        //     log(`(${e.getLocationX().toFixed(2)},${e.getLocationY().toFixed(2)})`)
        // })
        // cc.find('log').on(cc.Node.EventType.TOUCH_END,(e:cc.Touch)=>{
        //     this.PlayOut(()=>{})
        // })
        // ['1','2','3'].map((id,idx)=>{
        //     this.initUserInfo(db.collection('users').get(id),idx)
        // })
        // this.shuffleCards=puke.ShuffleCards()
        // this.initHandCards(this.shuffleCards.slice(0,17));
        // this.updateLeftOut(this.shuffleCards.slice(10,22),17)
        // this.updateRightOut(this.shuffleCards.slice(10,22),17)

        this.adjustAnchors();

    }
    adjustAnchors(){
        //调整不同手机型号按钮坐标
        this.handCardsAnchor.y=70-cc.view.getVisibleSize().height/2;
        this.dzCardAnchor.y=-35+cc.view.getVisibleSize().height/2;
        this.buttonAnchor.y=this.outCardsAnchor.y=160-cc.view.getVisibleSize().height/2;
        this.leftCardsAnchor.x=cc.view.getDesignResolutionSize().width*(-1/5);
        this.rightCardsAnchor.x=cc.view.getDesignResolutionSize().width/5;
        this.leftCardsAnchor.y=this.rightCardsAnchor.y=350-cc.view.getVisibleSize().height/2;
        this.leftCntLeft.position=cc.v3(150-cc.view.getVisibleSize().width/2,280-cc.view.getVisibleSize().height/2);
        this.leftCntRight.position=cc.v3(-150+cc.view.getVisibleSize().width/2,280-cc.view.getVisibleSize().height/2);
    }
    selfPositionIdx=0
    initUserInfo(info,positionIdx){
        var user=cc.instantiate(this.userPre)
        var position
        if(positionIdx==this.selfPositionIdx) position='center'
        if(positionIdx==(this.selfPositionIdx+2)%3) position='right'
        if(positionIdx==(this.selfPositionIdx+1)%3) position='left'
        if(this.userInfoLoad[position]) return
        switch(position){
            case 'center':
                user.x=70;user.y=115;break;
            case 'left':
                user.x=70;user.y=380;break
            case 'right':
                user.x=890;user.y=380;break
        }
        this.userInfoLoad[position]=true;
        user.x-=cc.view.getVisibleSize().width/2
        user.y-=cc.view.getVisibleSize().height/2
        user.getChildByName('name').getComponent(cc.Label).string=info.name
        user.getChildByName("money").getChildByName('value').getComponent(cc.Label).string=info.value
        this.node.addChild(user)
    }
    centifyCard(cardArr:Array<Card>){
        if(cardArr.length==0) return
        var cardViewWidth=cardArr[0].node.width/2
        var cardBias=-cardArr.length/2*cardViewWidth;
        cardArr.map(card=>{
            card.node.position=cc.v3(cardBias=cardBias+cardViewWidth,0,0)
        })
    }
    operateCards(hover,choose,inc=true,fromCnt=0,toCnt=this.selectCnt.value){
        var start = this.selectStartIdx + fromCnt 
        var end   = this.selectStartIdx+toCnt
        var from  = Math.max(0, Math.min(start,end)) + (inc?0:(fromCnt>0?+1:-1))
        var to    = Math.min(this.handCards.length-1, Math.max(start,end))
        for(var i=from;i<=to;i++) {
            if(choose!=-1) this.handCards[i].choose(choose)
            if(hover !=-1) this.handCards[i].hover(hover)
        }
    }
    updateChooseIdxs(){
        this.chooseIdxs=[]
        for(var i=0;i<this.handCards.length;i++)
            if(this.handCards[i].getChoose())
                this.chooseIdxs.push(i)
        this.chooseIdxs.sort((a,b)=>{return b-a})
    }
    newCard(cardinfo,parent:cc.Node){
        var card:Card=cc.instantiate(this.cardPre).getComponent(Card);
        parent.addChild(card.node)
        card.node.position=cc.v3(0,0)
        card.InitCard(cardinfo)
        return card
    }
    updateLeftOut(infos,left){
        if(!infos || infos==[]) return
        this.leftCntLeft.getChildByName('number').getComponent(cc.Label).string=left
        this.leftOutCard=[]
        this.leftCardsAnchor.removeAllChildren()
        infos.map(info=>{
            this.leftOutCard.push(this.newCard(info,this.leftCardsAnchor))
        })
        this.centifyCard(this.leftOutCard)
    }
    updateRightOut(infos,left){
        if(!infos || infos==[]) return
        this.leftCntRight.getChildByName('number').getComponent(cc.Label).string=left
        this.rightOutCard=[]
        this.rightCardsAnchor.removeAllChildren()
        infos.map(info=>{
            this.rightOutCard.push(this.newCard(info,this.rightCardsAnchor))
        })
        this.centifyCard(this.rightOutCard)
    }
    addDzcards(dzcards){
        this.initHandCards(this.handCards.map(card=>{
            return card.info
        }).concat(dzcards))
        //展示地主牌
    }
    showDzcards(dzcards){
        dzcards.map(info=>{
            this.dzCard.push(this.newCard(info,this.dzCardAnchor))
        })
        this.centifyCard(this.dzCard)
    }
    clearOut(){
        this.outCards=[]
        this.outCardsAnchor.removeAllChildren()
    }
    lastOutStyle={
        type:null,grade:-1,cards:[]
    }
    PlayOut(success){
        this.outCards=[]
        this.outCardsAnchor.removeAllChildren()
        var cardinfos=[]
        if(this.chooseIdxs.length!=0)
            this.chooseIdxs.map(idx=>{ 
                cardinfos.push(this.handCards[idx].info)
            })
        var outStyle=puke.outCardCheck(cardinfos.map(info=>{return info.value}))
        var lastOutStyle=this.buttonAnchor.getComponent(Client).outStyle
        log(outStyle)
        log(lastOutStyle)
        if(!outStyle){
            common.alert('出牌不符合要求',this.handCardsAnchor)
            return
        }
        if(lastOutStyle.type!=null){
            if(lastOutStyle.type!=outStyle.type){
                if(outStyle.type!='炸弹'){
                    common.alert('出牌不符合要求',this.handCardsAnchor)
                    return
                }
            }
            else if(lastOutStyle.grade>=outStyle.grade){
                common.alert('出牌不符合要求',this.handCardsAnchor)
                return
            }
        }
        success()
        this.chooseIdxs.map(idx=>{ 
            var cardNode=this.handCards[idx].node
            this.outCards.push(this.handCards[idx])
            this.handCardsAnchor.removeChild(cardNode); 
            _.pullAt(this.handCards,idx) 
            this.outCardsAnchor.addChild(cardNode); 
        })
        this.handCards.map((card,idx)=>{ card.Idx=idx })
        this.centifyCard(this.handCards)
        puke.beatify(this.outCards)
        this.centifyCard(this.outCards)
        outStyle['cards']=cardinfos
        doTask('playOut',null,outStyle)
    }
    initHandCards(cardsInfos){
        this.leftCntLeft.active=true
        this.leftCntRight.active=true
        cardsInfos=puke.sortCards(cardsInfos)
        this.handCardsAnchor.removeAllChildren()
        this.handCards=[]
        var halfScreenWidth=cc.view.getVisibleSize().width/2
        cardsInfos.map((cardInfo,idx)=>{
            var card=this.newCard(cardInfo,this.handCardsAnchor)
            this.handCards.push(card)
            card.Idx=idx;
            card.info=cardInfo
            card.node.on(cc.Node.EventType.TOUCH_START ,( )=>{ card.hover(true); this.selectStartIdx=card.Idx;  })
            card.node.on(cc.Node.EventType.TOUCH_END   ,( )=>{ 
                card.hover(false);  
                if(this.selectCnt.value!=0)//选择底部下一张
                this.operateCards(false,null)
                else card.choose()
                this.selectCnt.value=null
                this.updateChooseIdxs()
            })
            card.node.on(cc.Node.EventType.TOUCH_MOVE  ,(e:cc.Touch)=>{ 
                this.selectCnt.value=Math.floor((e.getLocation().x-card.node.x-halfScreenWidth)/(card.node.width/2))+1
             })
            card.node.on(cc.Node.EventType.TOUCH_CANCEL,()=>{
                if(this.selectCnt.value==0) return;
                this.operateCards(false,null)
                this.selectCnt.value=null
                this.updateChooseIdxs()
            })
        })
        this.selectCnt.onChange=(value,origin)=>{
            var inc=value-origin>0 == value>0 && value!=0
            if(value==null || origin==null) return//选择完毕
            this.operateCards(inc,-1,inc,origin,value)//选择减少时 少减一张
        }
        this.centifyCard(this.handCards)
    }
}
