import * as lodash from 'lodash'
const log=console.log
class database{
    constructor(){
    }
    collection(dir){
        return new databasedir(dir)
    }
}
class databasedir{
    root
    constructor(dir){
        this.root=dir
    }
    get(id){
        return JSON.parse(cc.sys.localStorage.getItem(this.root+"_"+id))
    }
    remove(id){
        cc.sys.localStorage.removeItem(this.root+"_"+id)
    }
    add(data){
        cc.sys.localStorage.setItem(this.root+"_"+data._id,JSON.stringify(data))
    }
    doc(id){
        return new databasefile(this.root+"_"+id)
    }
}
class databasefile{
    root
    constructor(filepath){
        this.root=filepath
    }
    get(){
        return JSON.parse(cc.sys.localStorage.getItem(this.root))
    }
    remove(){
        cc.sys.localStorage.removeItem(this.root)
    }
    update(data){
        cc.sys.localStorage.setItem(this.root,JSON.stringify(data))
    }
}

export var db = new database()

export class wxbase{
    cloud:wxcloud
    constructor(uid){
        this.cloud=new wxcloud(uid)
    }
    getId(){
        return this.cloud.uid
    }
}

class wxcloud{
    uid
    constructor(uid){
        this.uid=uid
    }
    callFunction(json){
        var data=json.data
        var complete=json.complete
        data['uid']=this.uid
        var json=Task[data.do](data)
        setTimeout(()=>{
            complete(json)
        },200)
    }
}


var Task={
    'joinRoom'    : joinRoom,
    'prepare'     : prepare,
    'prepareCard' : prepareCard,
    'grabCard'    : grabCard,
    'playOut'     : playOut,
    'listen'      : listen,
    'quit'        : quit,
    null: ()=>{log('no task')}
}
function listen(options){
    return db.collection('rooms').get(options.roomId)
}
function nextPlayer(roomInfo){
    var playerKey=Object.keys(roomInfo.players)
    roomInfo.timeto=playerKey[(playerKey.indexOf(roomInfo.timeto)+1)%3]
}
function joinRoom(options){
    var roomInfo=db.collection('rooms').get(options.roomId)
    if(roomInfo){
        roomInfo.players[options.uid]=false
        roomInfo.playersInfo[options.uid]=db.collection('users').get(options.uid)
        roomInfo.gameState=Object.keys(roomInfo.players).length<=2?'join':'prepare'
        db.collection('rooms').doc(options.roomId).update(roomInfo)
    return roomInfo
    }else{
        var players={}
        players[options.uid]=false
        var playersInfo={}
        playersInfo[options.uid]=db.collection('users').get(options.uid)
        roomInfo={
            _id:options.roomId, 
            gameState:'join',
            players,playersInfo
        }
        db.collection('rooms').add(roomInfo)
        return roomInfo
    }
}
function prepare(options){
    var roomInfo=db.collection('rooms').get(options.roomId)
    roomInfo.players[options.uid]=true
    var prepareCnt=0
    Object.keys(roomInfo.players).map(key=>{
        if(roomInfo.players[key]) prepareCnt++
    })
    if(prepareCnt==3) {
        Object.keys(roomInfo.players).map(key=>{
            roomInfo.players[key]=false
        })
        roomInfo.gameState='get'
        var cards=pukeManeger.ShuffleCards()
        var bias=0
        roomInfo['hand']={}
        Object.keys(roomInfo.players).map(key=>{
            roomInfo['hand'][key]=cards.slice(bias,bias=bias+17)
        })
        roomInfo["dzcards"]=cards.slice(bias,cards.length)
    }
    db.collection('rooms').doc(options.roomId).update(roomInfo)
    return roomInfo
}
function prepareCard(options){
    var roomInfo=db.collection('rooms').get(options.roomId)
    roomInfo.players[options.uid]=true
    var prepareCnt=0
    Object.keys(roomInfo.players).map(key=>{
        if(roomInfo.players[key]) prepareCnt++
    })
    if(prepareCnt==3) {
        roomInfo.gameState='grab'
        delete roomInfo.hand
        delete roomInfo.dzcards
        delete roomInfo.playersInfo
        Object.keys(roomInfo.players).map(key=>{ roomInfo.players[key]=-1 })
        roomInfo['timeto']=Object.keys(roomInfo.players)[lodash.shuffle([0,1,2])[0]]
        
    }
    db.collection('rooms').doc(options.roomId).update(roomInfo)
    return roomInfo
}
function grabCard(options){
    var roomInfo=db.collection('rooms').get(options.roomId)
    roomInfo.players[options.uid]=options.params.grab
    var grabCnt=0
    Object.keys(roomInfo.players).map(key=>{
        if(roomInfo.players[key]>=0) grabCnt++
    })
    nextPlayer(roomInfo)
    if(grabCnt==3){
        roomInfo['out']={}
        roomInfo.gameState='gaming'
        Object.keys(roomInfo.players).map(key=>{ 
            roomInfo.players[key]=17 
            roomInfo['out'][key]={
                type:null,grade:-1,cards:[]
            }
        })
        while(roomInfo.players[roomInfo.timeto]==0) nextPlayer(roomInfo)
        roomInfo.players[roomInfo.timeto]+=3
        roomInfo['lastOut']=roomInfo.timeto
        roomInfo['lastEffect']=roomInfo.timeto
    }
    db.collection('rooms').doc(options.roomId).update(roomInfo)
    return roomInfo
}
function playOut(options){
    var cards=options.params.cards
    var roomInfo=db.collection('rooms').get(options.roomId)
    roomInfo.players[options.uid]-=cards.length
    roomInfo.out[options.uid]=options.params
    roomInfo.lastOut=options.uid
    if(options.params.cards.length>0)
        roomInfo.lastEffect=options.uid
    if(roomInfo.players[options.uid]==0)
        roomInfo.gameState='end'
    nextPlayer(roomInfo)
    db.collection('rooms').doc(options.roomId).update(roomInfo)
    return roomInfo
}
function quit(options){
    var roomInfo=db.collection('rooms').get(options.roomId)
    roomInfo.gameState='join'
    log('quit')
    delete roomInfo.players[options.uid]
    if(Object.keys(roomInfo.players).length==0){
        db.collection('rooms').doc(options.roomId).remove()
    }
    db.collection('rooms').doc(options.roomId).update(roomInfo)
    return roomInfo
}


class puke{
    value=['3','4','5','6','7','8','9','10','J','Q','K','A','2','g','G']
    grade(val){ return this.value.indexOf(val) }
    ShuffleCards(){
        var unshuffledCards=[];
        var cardId=-1
        this.value.map(value=>{
            ['fk','hx','ht','mh'].map(type=>{
                if(value!='g' && value!='G')
                unshuffledCards.push({value,type,grade:this.grade(value),
                    color:(type=='fk'||type=='hx')?'RED':'BLACK',
                    text:value,id:cardId=cardId+1
                })
            })
        })
        var JOKER='J\nO\nK\nE\nR'
        unshuffledCards.push({value:'g',text:JOKER,type:null,grade:13,color:'BLACK',id:cardId=cardId+1});
        unshuffledCards.push({value:'G',text:JOKER,type:null,grade:14,color:'RED'  ,id:cardId=cardId+1});
        var shuffledCards = lodash.shuffle(unshuffledCards)
        return shuffledCards
    }
}
var pukeManeger=new puke()