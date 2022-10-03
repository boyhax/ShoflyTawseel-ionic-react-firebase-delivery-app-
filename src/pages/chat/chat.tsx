import React, { FC, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonTitle, IonToolbar,IonButtons, IonInput, IonLabel, IonItem, IonAccordionGroup, IonAccordion, IonList, IonSpinner, IonBackButton, IonSlides, IonSlide, IonCard, IonCardTitle, IonAvatar, IonImg, IonButton, IonIcon, IonFooter, IonGrid, IonCol } from '@ionic/react';
import { useGlobals } from '../../providers/globalsProvider';
import { addDoc, collection, doc, DocumentData, DocumentReference, DocumentSnapshot, FieldValue, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, QueryDocumentSnapshot, QuerySnapshot, serverTimestamp, setDoc, Timestamp, Unsubscribe, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {  Redirect, useHistory, useParams } from 'react-router';
import { TT } from '../../components/utlis/tt';
import { db } from '../../App';
import { attachOutline, sendOutline } from 'ionicons/icons';

import "./chat.css"

interface MessageProps{
  time:any ,
  text:string,
  type:string,
  data:any,
  from:string,
  isRead?:boolean
}
export default  function Chat(props:any) {
    const {user,profile} = useGlobals()
    const [loading,setLoading]=useState(true)
    const [chatDocSnap,setChatDocSnap] = useState<null|QueryDocumentSnapshot<DocumentData>>(null)
    const [refreshing,setRefreshing] = useState(true)
    const [isMounted, setIsMounted] = useState(true)
    const [chatInput, setChatInput] = useState<string>("")
    const uid = getAuth().currentUser?.uid

    const [Messages,setMessages]=useState<null|MessageProps[]>(null)
    const auth= getAuth()
    const params:any = useParams()
    const history =useHistory()
    const {doc} = props
    const inputRef:any =useRef()


    useEffect( ()=>{
      if(!user){
        return
      }
      const unsub = getData();
      return()=>{if(!!unsub){unsub()}}
    },[user])
    useEffect(()=>{
      setIsMounted(true)
      return () => {
        setIsMounted(false)
      }
    },[])
  
      function getData() {
      setRefreshing(true)



      return  onSnapshot(query(collection(doc.ref,"messages"),orderBy("time","asc")),(snap)=>{
          console.log('messages snap :>> ', snap);
            
            if(isMounted && !snap.empty){
              let messages:MessageProps[]=[]
              snap.forEach((v)=>{
                const m = v.data()
                messages.push({
                  time:m.time,
                  text:m.text,
                  type:m.type,
                  data:m.data,
                  from:m.from,
                })
              })
              setMessages(messages)
            }
            setRefreshing(false)    
            })
      }

    function onSendMessage() {
      const text = chatInput;
      const from = getAuth().currentUser?.uid

      let newMessage={
        time:new Date(),
        from:from,
        data:null,
        type:"text",
        text:text,
        isRead:false,
      }
      addDoc(collection(db,"chats/"+doc.id,"/messages"),newMessage)
      // let messages = !!Messages?Messages:[]
      // messages.push(newMessage)
      // setMessages(messages)
      setChatInput("")
    }
    return (
    <IonPage >
      
      <IonToolbar color="secondary">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle slot='primary' >
          {TT("Chat")}
        </IonTitle>
      </IonToolbar>

      <IonContent >
        {!! Messages && Messages.map((value:MessageProps,key:any) => { 
              return<MessageBubble owner={value.from === uid} messageData={value} key={key}>
              
             </MessageBubble>
             })
             }
      </IonContent>
      <IonFooter>
              <IonItem>
                <IonButton fill='clear' onClick={()=>onSendMessage()}>
                  <IonIcon size='large' icon={sendOutline}></IonIcon>
                </IonButton>
                <IonInput type='text' clearInput={true} value={chatInput} 
                onIonChange={(e)=>setChatInput(String(e.detail.value))} 
                placeholder='write here'></IonInput>
                <IonButton fill='clear'>
                  <IonIcon size='large' icon={attachOutline}></IonIcon>
                </IonButton>
              </IonItem>
             </IonFooter>
    </IonPage>
  );
};




interface ChatItemProps {
  messageData:MessageProps,
  owner:boolean
  
}
 
interface ChatItemState {
  className:string
}
 
class MessageBubble extends React.Component<ChatItemProps, ChatItemState> {
  constructor(props: ChatItemProps) {
    super(props);
    this.state = {className : 'chatbubble' +this.props.owner?'right':'left'};
  };
  
  
  componentDidMount() {
  }
  // componentDidUpdate(prevProps: ChatItemProps, prevState: ChatItemState) {
  //   console.log('state  :>> ', this.state );
  // }
  
 
  render() { 
    return (<div  className={"chatbubble"} style={{
      float:this.props.owner?"right":"left",
      background:this.props.owner?"#116246":"#35304A",
      marginRight:this.props.owner?"0%":"30%",
      marginLeft:this.props.owner?"30%":"0%",
      color:"whitesmoke"
      }}>
      <IonLabel style={{padding:"10px"}}>{this.props.messageData.text}</IonLabel>
      <IonLabel slot='end' style={{fontSize: "0.2rem",paddingTop:"35%"}}>
        {new Date(this.props.messageData.time.seconds*1000)
      .toLocaleTimeString()}</IonLabel>
    </div> );
  }
}
//  message data
// data 
// ""
// (string)
// isRead
// true
// receiver 
// "asdsd"
// sender
// "dsfdfs"
// text
// "hello first message"
// time
// September 26, 2022 at 9:52:36 AM UTC+4
// type
// "text"