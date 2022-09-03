import React, { FC, useEffect, useState } from 'react';
import { IonContent, IonPage, IonTitle, IonToolbar,IonButton,IonIcon,IonButtons, IonInput, IonLabel, IonItem, IonAccordionGroup, IonAccordion, IonList, IonSpinner, IonBackButton, IonSlides, IonSlide } from '@ionic/react';
import { exitSharp, } from 'ionicons/icons';
import { useGlobals } from '../providers/globalsProvider';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import "./Profile.css"
import OrderCard from '../components/OrderCard';
import { Redirect, useHistory, useParams } from 'react-router';
import { orderProps, updateTripCard, updateUserProfile } from '../providers/firebaseMain';

const OrdersPage: React.FC = () => {
    const {user,profile} = useGlobals()
    const [loading,setLoading]=useState(true)
    const auth= getAuth()
    const id = useParams()
    const history =useHistory()
    
    useEffect(()=>{
      
  },[user]);
   
    if(!user){
      return<Redirect to={"/SignIn"}></Redirect>
    }
    
    return (
    <IonPage >
      
      <IonToolbar color="secondary">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle slot='primary' >
          طلباتك
        </IonTitle>
    
      </IonToolbar>
      <IonContent>
        {user && <IonContent>
          
          
          <IonSlides>
            <IonSlide>
                <IonContent>orders</IonContent>
            </IonSlide>
            <IonSlide>
            <IonContent>offers</IonContent>
            </IonSlide>
          </IonSlides>
                <ProfileOrdersList/>
      </IonContent>}
        
          {user && profile===undefined &&
          <IonContent>
            <IonSpinner></IonSpinner>
            <IonLabel>please waite..</IonLabel>
            </IonContent>}
</IonContent>
              
        
        
        
      
    </IonPage>
  );
};

export default OrdersPage;




const ProfileOrdersList:FC=(props)=>{
  const [list,setList]=useState<null|orderProps[]>(null)
  const [refreshing,setRefreshing] = useState(true)
  const [isMounted, setIsMounted] = useState(true)
  const {user,profile} = useGlobals()
  useEffect(()=>{
      getData();
  },[user])
  useEffect(()=>{
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  })

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
       if(isMounted){
        setList(newList)
        setRefreshing(false)    
       }
    
  } 
  function onOrderRemoved(value:object){
    const newList:any = list?.filter((value_)=>{
      return value_===value?false:true
    })
    setList(newList)
  }
  return<IonList>
    {refreshing && <IonSpinner></IonSpinner>}
      {!!list && list.map((value, index, array) => {
        if(profile){
          checkName(value,profile)
        }
        
        return <OrderCard order={value} key={index} remove onDeleted={()=>onOrderRemoved(value)}></OrderCard>
        })}
        {!list && !refreshing && <IonButton onClick={()=>getData()}>refresh</IonButton>}
  </IonList>
}
function checkName(value:orderProps,profile:any){
  // to be added to function
  if (value.name !== profile.name){
    updateTripCard(value.id!,{name:profile.name})
  }

}