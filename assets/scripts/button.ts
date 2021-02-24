const {ccclass, property} = cc._decorator;

@ccclass
export default class Button extends cc.Component {

    @property(cc.SpriteFrame)
    yellowBack: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    blueBack: cc.SpriteFrame = null
    Init(buttonInfo){
        this.init(buttonInfo.color,buttonInfo.text,buttonInfo.handler)
    }
    init(color='yellow',text=null,handler=null){
        this.node.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string=text
        if(color=='yellow')
            this.node.getChildByName('Background').getComponent(cc.Sprite).spriteFrame=this.yellowBack
        else
            this.node.getChildByName('Background').getComponent(cc.Sprite).spriteFrame=this.blueBack
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{ if(handler)handler() })
    }

}
