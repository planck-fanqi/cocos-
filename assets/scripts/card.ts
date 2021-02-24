// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var log=console.log
const {ccclass, property} = cc._decorator;
@ccclass
export default class Card extends cc.Component {
    @property(cc.SpriteFrame)
    background:cc.SpriteFrame=null
    @property(cc.SpriteFrame)
    SelectBack:cc.SpriteFrame=null
    @property(cc.SpriteFrame)
    cardTypes:Array<cc.SpriteFrame>=[]
    
    private chosenFlag={
        Value:false, delegate:null,
        set value(val){
            if(this.delegate && val!=this.Value) this.delegate(val)
            this.Value=val
        },
        get value(){ return this.Value }
    }
    private hoverFlag={
        Value:false,delegate:null,
        set value(val){
            if(this.delegate && val!=this.Value) this.delegate(val);
            this.Value=val;
        },
        get value(){ return this.Value }
    }
    touchStart:Function=function () {};
    touchMove :Function=function () {};
    Idx=-1
    info
    moveFlag=false
    choose(chooseVal=null){
        this.chosenFlag.value=chooseVal!=null? chooseVal: !this.chosenFlag.value
    }
    hover(hoverVal=null){
        this.hoverFlag.value=hoverVal!=null? hoverVal : !this.hoverFlag.value;
    }
    getChoose(){
        return this.chosenFlag.value
    }
    InitCard(info){
        this.initCard(info.type,info.text,info.color)
    }
    initCard(type,text,color){
        this.chosenFlag.delegate=(chosen)=>{
            this.node.y+=chosen?this.node.height/3:-this.node.height/3
        }
        this.hoverFlag.delegate=(hover)=>{
            this.node.getComponent(cc.Sprite).spriteFrame=hover?this.SelectBack:this.background;
        }
        if(type) this.node.getChildByName('type').getComponent(cc.Sprite).spriteFrame=this.cardTypes[['fk','ht','hx','mh'].indexOf(type)];
        if(!type) {
            var valueNode=this.node.getChildByName('value');
            valueNode.y=0;
            valueNode.getComponent(cc.Label).fontSize=18
            valueNode.getComponent(cc.Label).lineHeight=18
            this.node.getChildByName('type').getComponent(cc.Sprite).spriteFrame=null;
        }
        this.node.getChildByName('value').getComponent(cc.Label).string=text;
        this.node.getChildByName('value').color=color=='RED'?cc.Color.RED:cc.Color.BLACK;
        this.node.getComponent(cc.Sprite).spriteFrame=this.background;
    }
}
