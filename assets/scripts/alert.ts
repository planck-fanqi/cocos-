const {ccclass, property} = cc._decorator;

@ccclass
export default class Alert extends cc.Component {
    intervel
    init(text,parent:cc.Node){
        parent.addChild(this.node)
        this.node.position=cc.v3(0,0)
        this.node.getChildByName('text').getComponent(cc.Label).string=text
    }
    onLoad(){
        this.intervel=setInterval(()=>{
            this.node.parent.removeChild(this.node)
            clearInterval(this.intervel)
            this.destroy()
        },1000)
    }
}
