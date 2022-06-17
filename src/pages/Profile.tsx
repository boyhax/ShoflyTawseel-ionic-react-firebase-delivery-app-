import React, { FC, useEffect, useState } from 'react';
import { IonContent, IonPage, IonTitle, IonToolbar,IonButton,IonIcon,IonButtons, IonRouterLink, IonInput, IonLabel, IonItem, IonCard, IonCardContent, IonAccordionGroup, IonAccordion, IonList, IonGrid, IonSpinner } from '@ionic/react';
import { arrowBack, } from 'ionicons/icons';
import { useGlobals } from '../providers/globalsProvider';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import "./Profile.css"
import OrderCard, { OrderProps } from '../components/OrderCard';
import { useHistory, useParams } from 'react-router';
import { getProfile, profileExist, updateUserProfile } from '../providers/firebaseMain';

const Profile: React.FC = () => {
    const {user,profile} = useGlobals()
    const [loading,setLoading]=useState(true)
    const auth= getAuth()
    const id = useParams()
    const history =useHistory()
    
    
    async function  userProfileExist(){
      return await profileExist(auth.currentUser!.uid)
    }
    useEffect(()=>{
      
  },[user]);
   
    
    
    return (
    <IonPage >
      <IonToolbar color="secondary">
    <IonButtons slot="start">
          <IonButton  onClick={()=>history.goBack()}>
            <IonIcon icon={arrowBack}></IonIcon>
          </IonButton>
    </IonButtons>
    <IonTitle slot='primary' onClick={()=>history.push("/home")}  
    >ShoflyTawseel
    </IonTitle>
    
  </IonToolbar>
      <IonContent>
        {user && <IonContent>
          <IonButton onClick={()=>{history.push("/signin")}}>
            <IonTitle>تسجيل الخروج</IonTitle>
            </IonButton>

          <IonTitle>قائمة طلباتك</IonTitle>
          <ProfileOrdersList/>
      </IonContent>}
        {!user && loading === false && <IonContent>
          <IonButton onClick={()=>history.push('/SignIn')}>قم بتسجيل الدخول</IonButton>
          </IonContent>}
</IonContent>
              

      {user && auth.currentUser?.displayName==="" && <IonCard className='profileCard'><IonItem fill={undefined} shape={undefined} counter={undefined} counterFormatter={undefined} >يجب ان تضيف معلومات حسابك</IonItem>
        </IonCard>}
        {user && profile!==undefined && <ProfileEdit></ProfileEdit>}
      
    </IonPage>
  );
};

export default Profile;



const ProfileEdit:React.FC=(props)=>{
  const auth= getAuth()
  const user = auth.currentUser
  const uid = user?.uid
  const [data,setData]=useState({})
  const {profile} = useGlobals()
useEffect(()=>{
console.log(profile)
},[profile])
  return<IonAccordionGroup>
  <IonAccordion value="colors">
    <IonItem slot="header" >
      <IonLabel>معلومات المستخدم</IonLabel>
    </IonItem>

    <IonList slot="content">
      <IonItem >
        <IonLabel>الاسم</IonLabel>
        <IonInput placeholder='name' onIonChange={(e)=>{
            setData({...data,name:e.detail.value})
          
        }} 
        value={"profile exiset? "+String(profile)}></IonInput>
        <IonButton onClick={()=>updateUserProfile(uid,data)}>
          <IonLabel>حفظ</IonLabel></IonButton>
      </IonItem>
      <IonItem>
        <IonLabel>الرقم</IonLabel>
        <IonLabel >{auth.currentUser?.phoneNumber}</IonLabel>
      </IonItem>
      
    </IonList>
  </IonAccordion></IonAccordionGroup>
}
const ProfileOrdersList:FC=(props)=>{
  const [list,setList]=useState<null|OrderProps[]>(null)
  const [refreshing,setRefreshing] = useState(true)
  const {user} = useGlobals()
  useEffect(()=>{
      getData();
  },[user])

  async function getData() {
    setRefreshing(true)
    const ref = collection(getFirestore(),"orders")
    var firstQuery = query(ref,orderBy("time","desc"))
    var finalQuery= query(firstQuery,where("uid","==",getAuth().currentUser?.uid))
    const snapshot = await getDocs(finalQuery)
    var newList:any[]=[]
     snapshot.forEach((doc)=>{
        newList.push({id:doc.id,...doc.data()})
       })
    setList(newList)
    setRefreshing(false)
  } 
  return<IonList>
    {refreshing && <IonSpinner></IonSpinner>}
      {!!list && list.map((value, index, array) => {
        return <OrderCard values={value} key={index}></OrderCard>
        })}
  </IonList>
}